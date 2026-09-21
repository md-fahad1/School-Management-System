import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { gradeFromMarks, averageGpa } from '../common/utils/grading.util';
import { CreateCertificateDto } from './dto/create-certificate.dto';

interface RequestUser {
  id: string;
  role: Role;
  institutionId?: string | null;
}

const SCHOOL_NAME = process.env.SCHOOL_NAME ?? 'DreamsEdu School';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ---- Access control (same shape as the visibilityFilter used across the app) ----

  private async assertCanAccessStudent(studentId: string, requester: RequestUser) {
    const staffRoles: Role[] = [Role.ADMIN, Role.TEACHER, Role.PRINCIPAL];
    if (staffRoles.includes(requester.role)) return;

    if (requester.role === Role.STUDENT) {
      const self = await this.prisma.student.findUnique({ where: { userId: requester.id } });
      if (self?.id === studentId) return;
    }

    if (requester.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: requester.id },
        include: { students: true },
      });
      if (parent?.students.some((s) => s.id === studentId)) return;
    }

    throw new ForbiddenException('You are not allowed to access this student\'s documents');
  }

  // Each institution's own name goes on its documents (falls back to the
  // SCHOOL_NAME env var, then a generic default).
  private async schoolName(institutionId?: string | null): Promise<string> {
    if (institutionId) {
      const inst = await this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { name: true },
      });
      if (inst?.name) return inst.name;
    }
    return SCHOOL_NAME;
  }

  // ---- Report Card ----

  async createReportCardDocument(studentId: string, examTitle: string, requester: RequestUser) {
    await this.assertCanAccessStudent(studentId, requester);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, grade: true },
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    // Every exam in this student's class that shares this title is
    // treated as "this term's exams" — one per subject.
    const classExams = await this.prisma.exam.findMany({
      where: { title: examTitle, lesson: { classId: student.classId } },
      include: { lesson: { include: { subject: true } } },
    });
    if (classExams.length === 0) {
      throw new NotFoundException(`No exams titled "${examTitle}" found for ${student.class.name}`);
    }
    const examIds = classExams.map((e) => e.id);

    const results = await this.prisma.result.findMany({
      where: { studentId, examId: { in: examIds } },
      include: { exam: { include: { lesson: { include: { subject: true } } } } },
    });

    const subjects = results.map((r) => {
      const fullMarks = r.exam!.fullMarks;
      const band = gradeFromMarks(r.score, fullMarks);
      return {
        subjectName: r.exam!.lesson.subject.name,
        obtained: r.score,
        fullMarks,
        percentage: Math.round((r.score / fullMarks) * 10000) / 100,
        letter: band.letter,
        gpa: band.gpa,
      };
    });

    const overallGpa = averageGpa(subjects.map((s) => s.gpa));
    const totalObtained = subjects.reduce((sum, s) => sum + s.obtained, 0);
    const totalFullMarks = subjects.reduce((sum, s) => sum + s.fullMarks, 0);

    // Class rank: total score for every student in the class across
    // the same set of exams, ranked descending.
    const classmateResults = await this.prisma.result.findMany({
      where: { examId: { in: examIds }, student: { classId: student.classId } },
      select: { studentId: true, score: true },
    });
    const totals = new Map<string, number>();
    for (const r of classmateResults) {
      totals.set(r.studentId, (totals.get(r.studentId) ?? 0) + r.score);
    }
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const position = ranked.findIndex(([id]) => id === studentId) + 1;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    this.renderReportCardHeader(
      doc,
      student,
      examTitle,
      'REPORT CARD',
      await this.schoolName(requester.institutionId),
    );

    doc.moveDown(1);
    const tableTop = doc.y;
    const cols = { subject: 50, obtained: 280, full: 360, pct: 430, grade: 500 };
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Subject', cols.subject, tableTop);
    doc.text('Marks', cols.obtained, tableTop);
    doc.text('Full', cols.full, tableTop);
    doc.text('%', cols.pct, tableTop);
    doc.text('Grade', cols.grade, tableTop);
    doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).stroke();

    let y = tableTop + 26;
    doc.font('Helvetica').fontSize(11);
    for (const s of subjects) {
      doc.text(s.subjectName, cols.subject, y);
      doc.text(String(s.obtained), cols.obtained, y);
      doc.text(String(s.fullMarks), cols.full, y);
      doc.text(`${s.percentage}%`, cols.pct, y);
      doc.text(s.letter, cols.grade, y);
      y += 20;
    }
    doc.moveTo(50, y + 4).lineTo(545, y + 4).stroke();
    y += 16;

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total: ${totalObtained} / ${totalFullMarks}`, cols.subject, y);
    doc.text(`Overall GPA: ${overallGpa}`, cols.full, y);
    y += 22;
    doc.text(`Class Position: ${position} of ${ranked.length}`, cols.subject, y);

    doc.moveDown(4);
    this.renderSignatureLines(doc, ['Class Teacher', 'Principal']);

    return doc;
  }

  // ---- Admit Card ----

  async createAdmitCardDocument(studentId: string, examTitle: string, requester: RequestUser) {
    await this.assertCanAccessStudent(studentId, requester);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, grade: true },
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const exams = await this.prisma.exam.findMany({
      where: { title: examTitle, lesson: { classId: student.classId } },
      include: { lesson: { include: { subject: true } } },
      orderBy: { startTime: 'asc' },
    });
    if (exams.length === 0) {
      throw new NotFoundException(`No exams titled "${examTitle}" found for ${student.class.name}`);
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    this.renderReportCardHeader(
      doc,
      student,
      examTitle,
      'ADMIT CARD',
      await this.schoolName(requester.institutionId),
    );

    doc.moveDown(1);
    const tableTop = doc.y;
    const cols = { subject: 50, date: 250, start: 370, end: 460 };
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Subject', cols.subject, tableTop);
    doc.text('Date', cols.date, tableTop);
    doc.text('Start', cols.start, tableTop);
    doc.text('End', cols.end, tableTop);
    doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).stroke();

    let y = tableTop + 26;
    doc.font('Helvetica').fontSize(11);
    for (const e of exams) {
      doc.text(e.lesson.subject.name, cols.subject, y);
      doc.text(e.startTime.toISOString().split('T')[0], cols.date, y);
      doc.text(e.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), cols.start, y);
      doc.text(e.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), cols.end, y);
      y += 20;
    }

    doc.moveDown(4);
    doc.fontSize(10).font('Helvetica-Oblique').text(
      'Students must bring this admit card to every exam. No entry without it.',
      50,
      y + 20,
    );
    this.renderSignatureLines(doc, ['Exam Controller', 'Principal']);

    return doc;
  }

  // ---- Certificate (admin/principal only — enforced in the controller) ----

  async createCertificateDocument(studentId: string, input: CreateCertificateDto, requester: RequestUser) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const fullName = `${student.name} ${student.surname}`;
    const bodyText = input.body.replace(/\{name\}/g, fullName);
    const issuedDate = input.issuedDate ? new Date(input.issuedDate) : new Date();

    const doc = new PDFDocument({ size: 'A4', margin: 60, layout: 'landscape' });

    doc.font('Helvetica-Bold').fontSize(10).text((await this.schoolName(requester.institutionId)).toUpperCase(), { align: 'center' });
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(28).text(input.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(input.type, { align: 'center' });
    doc.moveDown(3);

    doc.font('Helvetica').fontSize(14).text(bodyText, {
      align: 'center',
      lineGap: 6,
    });

    doc.moveDown(4);
    doc.fontSize(11).text(`Issued on: ${issuedDate.toISOString().split('T')[0]}`, { align: 'center' });

    doc.moveDown(3);
    this.renderSignatureLines(doc, ['Class Teacher', 'Principal'], true);

    return doc;
  }

  // ---- Shared rendering helpers ----

  private renderReportCardHeader(doc: PDFKit.PDFDocument, student: any, examTitle: string, docTitle = 'REPORT CARD', schoolName = SCHOOL_NAME) {
    doc.font('Helvetica-Bold').fontSize(16).text(schoolName, { align: 'center' });
    doc.font('Helvetica').fontSize(11).text(docTitle, { align: 'center' });
    doc.font('Helvetica-Oblique').fontSize(10).text(examTitle, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(11);
    doc.text(`Name: ${student.name} ${student.surname}`, 50);
    doc.text(`Class: ${student.class.name}    Roll: ${student.roll ?? '-'}`, 50);
    doc.text(`Student ID: ${student.id}`, 50);
  }

  private renderSignatureLines(doc: PDFKit.PDFDocument, labels: string[], centered = false) {
    const y = doc.y;
    const width = centered ? 200 : 150;
    const gap = 60;
    let x = centered ? 100 : 50;

    for (const label of labels) {
      doc.moveTo(x, y).lineTo(x + width, y).stroke();
      doc.fontSize(10).text(label, x, y + 4, { width, align: 'center' });
      x += width + gap;
    }
  }
}