import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardCounts() {
    const [studentCount, teacherCount, parentCount, adminCount, boysCount, girlsCount] =
      await Promise.all([
        this.prisma.user.count({ where: { role: Role.STUDENT } }),
        this.prisma.user.count({ where: { role: Role.TEACHER } }),
        this.prisma.user.count({ where: { role: Role.PARENT } }),
        this.prisma.user.count({ where: { role: Role.ADMIN } }),
        this.prisma.student.count({ where: { sex: 'MALE' } }),
        this.prisma.student.count({ where: { sex: 'FEMALE' } }),
      ]);

    return { studentCount, teacherCount, parentCount, adminCount, boysCount, girlsCount };
  }

  /**
   * Present/absent counts per weekday for the current week (Mon-Fri),
   * computed from raw Attendance rows. Fine at current data volumes;
   * if attendance history grows large, this is a good candidate for a
   * proper SQL GROUP BY instead of pulling rows into JS to bucket them.
   */
  async getWeeklyAttendance() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: { date: { gte: monday, lte: friday } },
      select: { date: true, present: true },
    });

    const buckets: Record<string, { present: number; absent: number }> = {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

    for (const r of records) {
      const label = DAY_LABELS[r.date.getDay()];
      if (!buckets[label]) continue; // skip weekend records if any exist
      if (r.present) buckets[label].present++;
      else buckets[label].absent++;
    }

    return Object.entries(buckets).map(([day, counts]) => ({ day, ...counts }));
  }
}