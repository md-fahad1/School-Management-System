import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentInput, UpdateStudentInput } from './dto/student.dto';
import { StudentStatus } from '../common/enums/student-status.enum';
import { AuditService, AuditAction } from '../audit/audit.service';
@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

    /**
   * Self-service: a PARENT can list their own linked children without
   * needing the admin/teacher-only `students` query. Scoped by the
   * caller's userId, same visibilityFilter pattern used for results/
   * attendance/lessons elsewhere in the app.
   */
  findMyChildren(userId: string) {
    return this.prisma.student.findMany({
      where: { parent: { userId } },
      orderBy: { name: 'asc' },
      include: { user: true, class: true, grade: true, parent: true },
    });
  }
  findAll(search?: string, skip = 0, take = 10, status?: StudentStatus) {
    return this.prisma.student.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { user: true, class: true, grade: true, parent: true },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true, class: true, grade: true, parent: true },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async create(input: CreateStudentInput, actorId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) throw new BadRequestException('Username or email already in use');

    const targetClass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      include: { _count: { select: { students: true } } },
    });
    if (!targetClass) throw new BadRequestException('Class not found');
    if (targetClass._count.students >= targetClass.capacity) {
      throw new BadRequestException('Class is at full capacity');
    }

        // Grade always comes from the class, so the two can never disagree.
    const derivedGradeId = targetClass.gradeId;

    const hashed = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashed,
        role: Role.STUDENT,
        student: {
          create: {
            name: input.name,
            surname: input.surname,
            phone: input.phone,
            address: input.address,
            img: input.img,
            bloodType: input.bloodType,
            sex: input.sex,
            birthday: input.birthday ? new Date(input.birthday) : undefined,
            status: input.status,
            classId: input.classId,
            gradeId: derivedGradeId,
            parentId: input.parentId,
          },
        },
      },
      include: { student: true },
    });
        await this.auditService.log({
      userId: actorId,
      action: AuditAction.STUDENT_CREATE,
      success: true,
      metadata: { studentId: user.student?.id, name: input.name, surname: input.surname },
    });

    return user.student;
  }

    async update(id: string, input: UpdateStudentInput, actorId?: string) {
    let derivedGradeId: string | undefined;
    if (input.classId) {
      const cls = await this.prisma.class.findUnique({ where: { id: input.classId } });
      if (!cls) throw new BadRequestException('Class not found');
      derivedGradeId = cls.gradeId;
    }
    const before = await this.findOne(id);
    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        name: input.name,
        surname: input.surname,
        phone: input.phone,
        address: input.address,
        img: input.img,
        bloodType: input.bloodType,
        sex: input.sex,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
        status: input.status,
        classId: input.classId,
        gradeId: derivedGradeId,
        parentId: input.parentId,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.STUDENT_UPDATE,
      success: true,
      metadata: {
        studentId: id,
        before: { name: before.name, surname: before.surname, classId: before.classId },
        after: { name: updated.name, surname: updated.surname, classId: updated.classId },
      },
    });

    return updated;
  }

  /**
   * Dedicated status-change mutation (Active/Graduated/Transferred/
   * Suspended/...) so admins don't need to send a full profile update
   * just to flip a status, and so the audit trail records status
   * changes as their own action with an optional reason.
   */
  async updateStatus(id: string, status: StudentStatus, actorId?: string, reason?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.student.update({ where: { id }, data: { status } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.STUDENT_STATUS_CHANGE,
      success: true,
      metadata: { studentId: id, from: before.status, to: status, reason },
    });

    return updated;
  }

async remove(id: string, actorId?: string) {
  const student = await this.findOne(id);

  // Invoices and book loans reference the student without a cascade rule
  // by design — we never want deleting a profile to silently wipe out
  // financial or library records. Surface a clear, actionable error
  // instead of letting the raw Postgres FK-violation bubble up.
  const [invoiceCount, bookLoanCount] = await Promise.all([
    this.prisma.invoice.count({ where: { studentId: id } }),
    this.prisma.bookLoan.count({ where: { borrowerId: student.userId } }),
  ]);

  const blockers: string[] = [];
  if (invoiceCount > 0) {
    blockers.push(`${invoiceCount} invoice${invoiceCount === 1 ? '' : 's'}`);
  }
  if (bookLoanCount > 0) {
    blockers.push(`${bookLoanCount} library loan${bookLoanCount === 1 ? '' : 's'}`);
  }

  if (blockers.length > 0) {
    throw new BadRequestException(
      `Cannot delete this student: they have ${blockers.join(' and ')} on record. ` +
        `Resolve or reassign those first, or deactivate the student instead of deleting them.`,
    );
  }

  try {
    await this.prisma.user.delete({ where: { id: student.userId } });
        await this.auditService.log({
      userId: actorId,
      action: AuditAction.STUDENT_DELETE,
      success: true,
      metadata: { studentId: id, name: student.name, surname: student.surname },
    });
    return true;
  } catch (err) {
    // Safety net for any relation we haven't accounted for above —
    // never let a raw DB constraint error reach the client.
    throw new BadRequestException(
      'Cannot delete this student: they still have related records elsewhere in the system.',
    );
  }
}
  /**
   * Minimal CSV importer for students. Expects a header row with (at
   * minimum) username,email,password,name,surname,classId,gradeId,parentId
   * — phone,sex,address,bloodType are optional extra columns. Rows are
   * processed independently: one bad row (duplicate username, missing
   * class, etc.) is recorded and skipped rather than aborting the whole
   * import, since a 200-row CSV shouldn't fail entirely over row 47.
   */
  async importFromCsv(csvText: string, actorId?: string) {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { created: 0, failed: [{ row: 0, error: 'CSV has no data rows' }] };
    }

    const headers = this.parseCsvLine(lines[0]).map((h) => h.trim());
    const required = ['username', 'email', 'password', 'name', 'surname', 'classId', 'gradeId', 'parentId'];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      return { created: 0, failed: [{ row: 0, error: `Missing columns: ${missing.join(', ')}` }] };
    }

    let created = 0;
    const failed: { row: number; error: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => (row[h] = values[idx] ?? ''));

      try {
        await this.create(
          {
            username: row.username,
            email: row.email,
            password: row.password,
            name: row.name,
            surname: row.surname,
            classId: row.classId,
            gradeId: row.gradeId,
            parentId: row.parentId,
            phone: row.phone || undefined,
            address: row.address || undefined,
            bloodType: row.bloodType || undefined,
          } as any,
          actorId,
        );
        created++;
      } catch (err: any) {
        failed.push({ row: i + 1, error: err?.message ?? 'Unknown error' });
      }
    }

    return { created, failed };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }
}