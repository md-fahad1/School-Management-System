import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Role } from '@prisma/client';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Dashboard counts/attendance don't need to be up-to-the-second — every
// role's dashboard hits these on load, so a short cache turns N Postgres
// round trips into a single Redis GET for the vast majority of requests.
const DASHBOARD_COUNTS_TTL_SECONDS = 60;
const WEEKLY_ATTENDANCE_TTL_SECONDS = 60;
const DASHBOARD_COUNTS_KEY = 'stats:dashboard-counts';
const WEEKLY_ATTENDANCE_KEY = 'stats:weekly-attendance';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getDashboardCounts() {
    const cached = await this.redis.get(DASHBOARD_COUNTS_KEY);
    if (cached) return JSON.parse(cached);

    const [studentCount, teacherCount, parentCount, adminCount, boysCount, girlsCount] =
      await Promise.all([
        this.prisma.user.count({ where: { role: Role.STUDENT } }),
        this.prisma.user.count({ where: { role: Role.TEACHER } }),
        this.prisma.user.count({ where: { role: Role.PARENT } }),
        this.prisma.user.count({ where: { role: Role.ADMIN } }),
        this.prisma.student.count({ where: { sex: 'MALE' } }),
        this.prisma.student.count({ where: { sex: 'FEMALE' } }),
      ]);

    const result = { studentCount, teacherCount, parentCount, adminCount, boysCount, girlsCount };
    await this.redis.set(DASHBOARD_COUNTS_KEY, JSON.stringify(result), DASHBOARD_COUNTS_TTL_SECONDS);
    return result;
  }

  /**
   * Present/absent counts per weekday for the current week (Mon-Fri),
   * computed from raw Attendance rows. Fine at current data volumes;
   * if attendance history grows large, this is a good candidate for a
   * proper SQL GROUP BY instead of pulling rows into JS to bucket them.
   */
  async getWeeklyAttendance() {
    const cached = await this.redis.get(WEEKLY_ATTENDANCE_KEY);
    if (cached) return JSON.parse(cached);

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

    const result = Object.entries(buckets).map(([day, counts]) => ({ day, ...counts }));
    await this.redis.set(WEEKLY_ATTENDANCE_KEY, JSON.stringify(result), WEEKLY_ATTENDANCE_TTL_SECONDS);
    return result;
  }
}