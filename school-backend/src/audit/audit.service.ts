import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
         import { getTenant } from '../tenant/tenant-context';

export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGIN_LOCKED_OUT = 'LOGIN_LOCKED_OUT',
  REGISTER = 'REGISTER',
  REGISTER_DUPLICATE = 'REGISTER_DUPLICATE',
  REFRESH_SUCCESS = 'REFRESH_SUCCESS',
  REFRESH_FAILURE = 'REFRESH_FAILURE',
  REFRESH_REUSE_DETECTED = 'REFRESH_REUSE_DETECTED',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL_DEVICES = 'LOGOUT_ALL_DEVICES',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
   EMAIL_VERIFICATION_FAILURE = 'EMAIL_VERIFICATION_FAILURE',
  VERIFICATION_EMAIL_SENT = 'VERIFICATION_EMAIL_SENT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_CHANGE_FAILURE = 'PASSWORD_CHANGE_FAILURE',
  STUDENT_CREATE = 'STUDENT_CREATE',
  STUDENT_UPDATE = 'STUDENT_UPDATE',
  STUDENT_DELETE = 'STUDENT_DELETE',
     STUDENT_STATUS_CHANGE = 'STUDENT_STATUS_CHANGE',
  RESULT_CREATE = 'RESULT_CREATE',
  RESULT_UPDATE = 'RESULT_UPDATE',
  RESULT_DELETE = 'RESULT_DELETE',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  LEAVE_DECIDED = 'LEAVE_DECIDED',
  TEACHER_CREATE = 'TEACHER_CREATE',
  TEACHER_UPDATE = 'TEACHER_UPDATE',
  TEACHER_DELETE = 'TEACHER_DELETE',
  PARENT_CREATE = 'PARENT_CREATE',
  PARENT_UPDATE = 'PARENT_UPDATE',
  PARENT_DELETE = 'PARENT_DELETE',
  CLASS_CREATE = 'CLASS_CREATE',
  CLASS_UPDATE = 'CLASS_UPDATE',
  CLASS_DELETE = 'CLASS_DELETE',
  SUBJECT_CREATE = 'SUBJECT_CREATE',
  SUBJECT_UPDATE = 'SUBJECT_UPDATE',
  SUBJECT_DELETE = 'SUBJECT_DELETE',
  EXAM_CREATE = 'EXAM_CREATE',
  EXAM_UPDATE = 'EXAM_UPDATE',
  EXAM_DELETE = 'EXAM_DELETE',
  ASSIGNMENT_CREATE = 'ASSIGNMENT_CREATE',
  ASSIGNMENT_UPDATE = 'ASSIGNMENT_UPDATE',
  ASSIGNMENT_DELETE = 'ASSIGNMENT_DELETE',
  ATTENDANCE_CREATE = 'ATTENDANCE_CREATE',
  ATTENDANCE_UPDATE = 'ATTENDANCE_UPDATE',
  ATTENDANCE_DELETE = 'ATTENDANCE_DELETE',
  LESSON_CREATE = 'LESSON_CREATE',
  LESSON_UPDATE = 'LESSON_UPDATE',
  LESSON_DELETE = 'LESSON_DELETE',
  GRADE_CREATE = 'GRADE_CREATE',
  GRADE_UPDATE = 'GRADE_UPDATE',
  GRADE_DELETE = 'GRADE_DELETE',
  ANNOUNCEMENT_CREATE = 'ANNOUNCEMENT_CREATE',
  ANNOUNCEMENT_UPDATE = 'ANNOUNCEMENT_UPDATE',
  ANNOUNCEMENT_DELETE = 'ANNOUNCEMENT_DELETE',
  EVENT_CREATE = 'EVENT_CREATE',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_DELETE = 'EVENT_DELETE',
  BOOK_CREATE = 'BOOK_CREATE',
  BOOK_UPDATE = 'BOOK_UPDATE',
  BOOK_DELETE = 'BOOK_DELETE',
  BOOK_ISSUED = 'BOOK_ISSUED',
  BOOK_RETURNED = 'BOOK_RETURNED',
  TEACHER_ATTENDANCE_MARKED = 'TEACHER_ATTENDANCE_MARKED',
  STAFF_ATTENDANCE_MARKED = 'STAFF_ATTENDANCE_MARKED',
  VEHICLE_CREATE = 'VEHICLE_CREATE',
  VEHICLE_UPDATE = 'VEHICLE_UPDATE',
    VEHICLE_DELETE = 'VEHICLE_DELETE',
  INSTITUTION_CREATE = 'INSTITUTION_CREATE',
  INSTITUTION_UPDATE = 'INSTITUTION_UPDATE',
    INSTITUTION_STATUS_CHANGE = 'INSTITUTION_STATUS_CHANGE',
  ACADEMIC_YEAR_CREATE = 'ACADEMIC_YEAR_CREATE',
  ACADEMIC_YEAR_UPDATE = 'ACADEMIC_YEAR_UPDATE',
  ACADEMIC_YEAR_DELETE = 'ACADEMIC_YEAR_DELETE',
  ACADEMIC_YEAR_SET_CURRENT = 'ACADEMIC_YEAR_SET_CURRENT',
  DEPARTMENT_CREATE = 'DEPARTMENT_CREATE',
  DEPARTMENT_UPDATE = 'DEPARTMENT_UPDATE',
  DEPARTMENT_DELETE = 'DEPARTMENT_DELETE',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_PERMISSION_OVERRIDE_SET = 'USER_PERMISSION_OVERRIDE_SET',
}


interface AuditEntry {
  userId?: string;
  institutionId?: string;
           action: AuditAction | string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

interface AuditFilter {
  userId?: string;
  action?: string;
  success?: boolean;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Writes one audit entry. Deliberately swallows its own errors —
   * a database hiccup while logging a login attempt must never turn
   * into a failed login for the user. If writing fails, it's logged
   * locally via Nest's Logger instead of propagating.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      let institutionId = entry.institutionId ?? getTenant()?.institutionId;
         if (!institutionId && entry.userId) {
           const owner = await this.prisma.user.findUnique({
             where: { id: entry.userId },
             select: { institutionId: true },
           });
           institutionId = owner?.institutionId ?? undefined;
         }

         await this.prisma.auditLog.create({
        data: {
          institutionId,
           userId: entry.userId,
          action: entry.action,
          success: entry.success,
          ip: entry.ip,
          userAgent: entry.userAgent,
          metadata: entry.metadata as any,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log for action ${entry.action}: ${err}`);
    }
  }

  findAll(skip = 0, take = 50, filter: AuditFilter = {}) {
    return this.prisma.auditLog.findMany({
      where: filter,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(filter: AuditFilter = {}) {
    return this.prisma.auditLog.count({ where: filter });
  }
}