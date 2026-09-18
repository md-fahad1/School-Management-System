import { Controller, Get, Req, Res, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Plain-text CSV writer — quotes any field containing a comma, quote,
// or newline, doubling internal quotes per RFC 4180. Deliberately not
// pulling in a csv library for two fixed export shapes.
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

// Note: this uses the plain passport AuthGuard('jwt'), not the
// GqlJwtAuthGuard/RolesGuard pair used elsewhere — those two are wired
// specifically for GraphQL's execution context (they read req off the
// resolver's context, not off Express's (req, res) pair), so they don't
// attach correctly to a REST controller. Role checks below are done
// manually instead of via @Roles()/RolesGuard for the same reason.
@Controller('export')
@UseGuards(AuthGuard('jwt'))
export class ExportController {
  constructor(private prisma: PrismaService) {}

  @Get('students.csv')
  async exportStudents(@Req() req: any, @Res() res: Response) {
    if (![Role.ADMIN, Role.TEACHER].includes(req.user.role)) {
      throw new ForbiddenException('Not allowed to export students');
    }

    const students = await this.prisma.student.findMany({
      include: { user: true, class: true, grade: true, parent: true },
      orderBy: { name: 'asc' },
    });

    const rows = students.map((s) => ({
      name: s.name,
      surname: s.surname,
      username: s.user.username,
      email: s.user.email ?? '',
      phone: s.phone ?? '',
      className: s.class?.name ?? '',
      gradeLevel: s.grade?.level ?? '',
      parent: s.parent ? `${s.parent.name} ${s.parent.surname}` : '',
      sex: s.sex ?? '',
      address: s.address ?? '',
    }));

    const csv = toCsv(rows, [
      'name', 'surname', 'username', 'email', 'phone', 'className', 'gradeLevel', 'parent', 'sex', 'address',
    ]);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  }

  @Get('teachers.csv')
  async exportTeachers(@Req() req: any, @Res() res: Response) {
    if (![Role.ADMIN, Role.PRINCIPAL].includes(req.user.role)) {
      throw new ForbiddenException('Not allowed to export teachers');
    }

    const teachers = await this.prisma.teacher.findMany({
      include: { user: true, subjects: true },
      orderBy: { name: 'asc' },
    });

    const rows = teachers.map((t) => ({
      name: t.name,
      surname: t.surname,
      username: t.user.username,
      email: t.user.email ?? '',
      phone: t.phone ?? '',
      subjects: t.subjects.map((s) => s.name).join('; '),
    }));

    const csv = toCsv(rows, ['name', 'surname', 'username', 'email', 'phone', 'subjects']);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="teachers.csv"');
    res.send(csv);
  }
}