import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchResult } from './entities/search-result.entity';

const LIMIT_PER_CATEGORY = 5;

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim();

    const [students, teachers, classes, subjects, books] = await Promise.all([
      this.prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { surname: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: LIMIT_PER_CATEGORY,
        include: { class: true },
      }),
      this.prisma.teacher.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { surname: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: LIMIT_PER_CATEGORY,
      }),
      this.prisma.class.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PER_CATEGORY,
      }),
      this.prisma.subject.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PER_CATEGORY,
      }),
      this.prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { author: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: LIMIT_PER_CATEGORY,
      }),
    ]);

    const results: SearchResult[] = [
      ...students.map((s) => ({
        type: 'student',
        id: s.id,
        title: `${s.name} ${s.surname}`,
        subtitle: s.class ? `Student · ${s.class.name}` : 'Student',
        url: `/list/students/${s.id}`,
      })),
      ...teachers.map((t) => ({
        type: 'teacher',
        id: t.id,
        title: `${t.name} ${t.surname}`,
        subtitle: 'Teacher',
        url: `/list/teachers/${t.id}`,
      })),
      ...classes.map((c) => ({
        type: 'class',
        id: c.id,
        title: c.name,
        subtitle: 'Class',
        url: `/list/classes`,
      })),
      ...subjects.map((s) => ({
        type: 'subject',
        id: s.id,
        title: s.name,
        subtitle: 'Subject',
        url: `/list/subjects`,
      })),
      ...books.map((b) => ({
        type: 'book',
        id: b.id,
        title: b.title,
        subtitle: `Book · ${b.author}`,
        url: `/list/library`,
      })),
    ];

    return results;
  }
}