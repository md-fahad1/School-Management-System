import { Role } from '@prisma/client';

export interface PermissionDef {
  key: string; // "module:action"
  module: string;
  action: string;
  description: string;
}

// Prati module-er jonno standard CRUD + kichu special action.
// Notun module add korle just ei array-e entry barabe.
export const PERMISSIONS: PermissionDef[] = [
  // --- User / Auth ---
  { key: 'user:create', module: 'user', action: 'create', description: 'Create any user account' },
  { key: 'user:view', module: 'user', action: 'view', description: 'View user accounts' },
  { key: 'user:update', module: 'user', action: 'update', description: 'Update user accounts' },
  { key: 'user:delete', module: 'user', action: 'delete', description: 'Delete/deactivate user accounts' },
  { key: 'role:manage', module: 'role', action: 'manage', description: 'Create/edit custom roles and assign permissions' },

  // --- Student ---
  { key: 'student:create', module: 'student', action: 'create', description: 'Admit/create a student' },
  { key: 'student:view', module: 'student', action: 'view', description: 'View student profiles' },
  { key: 'student:update', module: 'student', action: 'update', description: 'Update student profiles' },
  { key: 'student:delete', module: 'student', action: 'delete', description: 'Delete/withdraw a student' },

  // --- Teacher ---
  { key: 'teacher:create', module: 'teacher', action: 'create', description: 'Create a teacher profile' },
  { key: 'teacher:view', module: 'teacher', action: 'view', description: 'View teacher profiles' },
  { key: 'teacher:update', module: 'teacher', action: 'update', description: 'Update teacher profiles' },
  { key: 'teacher:delete', module: 'teacher', action: 'delete', description: 'Delete a teacher profile' },

  // --- Parent ---
  { key: 'parent:create', module: 'parent', action: 'create', description: 'Create a parent/guardian profile' },
  { key: 'parent:view', module: 'parent', action: 'view', description: 'View parent/guardian profiles' },
  { key: 'parent:update', module: 'parent', action: 'update', description: 'Update parent/guardian profiles' },
  { key: 'parent:delete', module: 'parent', action: 'delete', description: 'Delete a parent/guardian profile' },

  // --- Class / Subject / Lesson ---
  { key: 'class:create', module: 'class', action: 'create', description: 'Create a class' },
  { key: 'class:view', module: 'class', action: 'view', description: 'View classes' },
  { key: 'class:update', module: 'class', action: 'update', description: 'Update classes' },
  { key: 'class:delete', module: 'class', action: 'delete', description: 'Delete a class' },
  { key: 'subject:create', module: 'subject', action: 'create', description: 'Create a subject' },
  { key: 'subject:view', module: 'subject', action: 'view', description: 'View subjects' },
  { key: 'subject:update', module: 'subject', action: 'update', description: 'Update subjects' },
  { key: 'subject:delete', module: 'subject', action: 'delete', description: 'Delete a subject' },
  { key: 'lesson:create', module: 'lesson', action: 'create', description: 'Create a lesson/routine slot' },
  { key: 'lesson:view', module: 'lesson', action: 'view', description: 'View routine' },
  { key: 'lesson:update', module: 'lesson', action: 'update', description: 'Update routine' },
  { key: 'lesson:delete', module: 'lesson', action: 'delete', description: 'Delete routine slot' },

  // --- Exam / Assignment / Result ---
  { key: 'exam:create', module: 'exam', action: 'create', description: 'Create an exam' },
  { key: 'exam:view', module: 'exam', action: 'view', description: 'View exams' },
  { key: 'exam:update', module: 'exam', action: 'update', description: 'Update exams' },
  { key: 'exam:delete', module: 'exam', action: 'delete', description: 'Delete exams' },
  { key: 'assignment:create', module: 'assignment', action: 'create', description: 'Create assignments' },
  { key: 'assignment:view', module: 'assignment', action: 'view', description: 'View assignments' },
  { key: 'assignment:update', module: 'assignment', action: 'update', description: 'Update assignments' },
  { key: 'assignment:delete', module: 'assignment', action: 'delete', description: 'Delete assignments' },
  { key: 'result:create', module: 'result', action: 'create', description: 'Enter marks/results' },
  { key: 'result:view', module: 'result', action: 'view', description: 'View results' },
  { key: 'result:update', module: 'result', action: 'update', description: 'Update marks/results' },
  { key: 'result:delete', module: 'result', action: 'delete', description: 'Delete results' },
  { key: 'result:publish', module: 'result', action: 'publish', description: 'Publish results to students/parents' },

  // --- Attendance / Leave ---
  { key: 'attendance:create', module: 'attendance', action: 'create', description: 'Take student attendance' },
  { key: 'attendance:view', module: 'attendance', action: 'view', description: 'View attendance' },
  { key: 'attendance:update', module: 'attendance', action: 'update', description: 'Correct attendance' },
  { key: 'attendance:delete', module: 'attendance', action: 'delete', description: 'Delete an attendance record' },
  { key: 'staffAttendance:create', module: 'staffAttendance', action: 'create', description: 'Record staff/teacher check-in-out' },
  { key: 'staffAttendance:view', module: 'staffAttendance', action: 'view', description: 'View staff/teacher attendance' },
  { key: 'leave:create', module: 'leave', action: 'create', description: 'Apply for leave' },
  { key: 'leave:view', module: 'leave', action: 'view', description: 'View leave applications' },
  { key: 'leave:approve', module: 'leave', action: 'approve', description: 'Approve/reject leave applications' },

  // --- Fees / Payments ---
  { key: 'fee:create', module: 'fee', action: 'create', description: 'Create fee structures/invoices' },
  { key: 'fee:view', module: 'fee', action: 'view', description: 'View fees/invoices' },
  { key: 'fee:update', module: 'fee', action: 'update', description: 'Update fee structures/invoices' },
  { key: 'fee:collect', module: 'fee', action: 'collect', description: 'Record a payment against an invoice' },
  { key: 'fee:refund', module: 'fee', action: 'refund', description: 'Issue a refund' },
  { key: 'fee:delete', module: 'fee', action: 'delete', description: 'Delete fee records' },

  // --- Library ---
  { key: 'book:create', module: 'book', action: 'create', description: 'Add a book' },
  { key: 'book:view', module: 'book', action: 'view', description: 'View books' },
  { key: 'book:update', module: 'book', action: 'update', description: 'Update book details' },
  { key: 'book:delete', module: 'book', action: 'delete', description: 'Remove a book' },
  { key: 'bookLoan:issue', module: 'bookLoan', action: 'issue', description: 'Issue a book' },
  { key: 'bookLoan:return', module: 'bookLoan', action: 'return', description: 'Process a book return' },
  { key: 'bookLoan:view', module: 'bookLoan', action: 'view', description: 'View loan history' },

  // --- Transport ---
  { key: 'transport:create', module: 'transport', action: 'create', description: 'Add vehicles/routes' },
  { key: 'transport:view', module: 'transport', action: 'view', description: 'View transport info' },
  { key: 'transport:update', module: 'transport', action: 'update', description: 'Update transport info' },
  { key: 'transport:delete', module: 'transport', action: 'delete', description: 'Delete transport records' },

  // --- Communication ---
  { key: 'event:create', module: 'event', action: 'create', description: 'Create events' },
  { key: 'event:view', module: 'event', action: 'view', description: 'View events' },
  { key: 'event:update', module: 'event', action: 'update', description: 'Update events' },
  { key: 'event:delete', module: 'event', action: 'delete', description: 'Delete events' },
  { key: 'announcement:create', module: 'announcement', action: 'create', description: 'Publish announcements' },
  { key: 'announcement:view', module: 'announcement', action: 'view', description: 'View announcements' },
  { key: 'announcement:update', module: 'announcement', action: 'update', description: 'Update announcements' },
  { key: 'announcement:delete', module: 'announcement', action: 'delete', description: 'Delete announcements' },
  { key: 'message:create', module: 'message', action: 'create', description: 'Send messages' },
  { key: 'message:view', module: 'message', action: 'view', description: 'View messages' },

  // --- Reporting / System ---
  { key: 'report:view', module: 'report', action: 'view', description: 'View reports/analytics' },
  { key: 'export:create', module: 'export', action: 'create', description: 'Export data' },
  { key: 'audit:view', module: 'audit', action: 'view', description: 'View audit logs' },
];

// Legacy Role enum-er jonno default permission mapping.
// Custom role assign na kora shob user ei fallback e cholbe.
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
    SUPER_ADMIN: [], // platform owner: manages institutions only (via @Roles), no tenant permissions
  ADMIN: PERMISSIONS.map((p) => p.key), // full access
  PRINCIPAL: PERMISSIONS.filter((p) =>
    !['user', 'role'].includes(p.module),
  ).map((p) => p.key), // sob kichu dekhte o manage korte pare, user/role management chhara
  TEACHER: [
    'student:view', 'parent:view',
    'class:view', 'subject:view', 'lesson:view',
    'exam:create', 'exam:view', 'exam:update', 'exam:delete',
    'assignment:create', 'assignment:view', 'assignment:update', 'assignment:delete',
    'result:create', 'result:view', 'result:update',
    'attendance:create', 'attendance:view', 'attendance:update', 'attendance:delete',
    'staffAttendance:view',
    'leave:create', 'leave:view',
    'event:create', 'event:view', 'event:update', 'event:delete',
    'announcement:create', 'announcement:view', 'announcement:update', 'announcement:delete',
    'message:create', 'message:view',
    'book:view', 'bookLoan:view', 'report:view',
  ],
  ACCOUNTANT: [
    'student:view', 'fee:create', 'fee:view', 'fee:update', 'fee:collect', 'fee:refund', 'fee:delete',
    'leave:create', 'leave:view', 'staffAttendance:view',
    'report:view', 'export:create', 'announcement:view', 'message:create', 'message:view',
  ],
  LIBRARIAN: [
    'student:view', 'teacher:view',
    'book:create', 'book:view', 'book:update', 'book:delete',
    'bookLoan:issue', 'bookLoan:return', 'bookLoan:view',
    'leave:create', 'leave:view', 'staffAttendance:view',
    'announcement:view', 'message:create', 'message:view',
  ],
  TRANSPORT_STAFF: [
    'transport:create', 'transport:view', 'transport:update', 'transport:delete',
    'student:view', 'leave:create', 'leave:view', 'staffAttendance:view',
    'announcement:view', 'message:create', 'message:view',
  ],
  STUDENT: [
    'result:view', 'attendance:view', 'assignment:view', 'exam:view', 'lesson:view',
    'fee:view', 'leave:create', 'leave:view', 'book:view', 'bookLoan:view',
    'event:view', 'announcement:view', 'message:create', 'message:view',
  ],
  PARENT: [
    'student:view', 'result:view', 'attendance:view', 'assignment:view', 'exam:view', 'lesson:view',
    'fee:view', 'leave:create', 'leave:view', 'book:view', 'bookLoan:view',
    'event:view', 'announcement:view', 'message:create', 'message:view',
  ],
};