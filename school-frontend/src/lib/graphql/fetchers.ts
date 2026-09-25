import "server-only";
import type { AcademicYearItem, DepartmentItem } from "@/lib/academic";
import { LARGE_PAGE_SIZE, emptyPage, pageArgs, toPaged } from "@/lib/pagination";
import { getServerClient, getServerRole } from "./server-client";
import {
  GET_ANNOUNCEMENTS,
  GET_ASSIGNMENTS,
  GET_ATTENDANCES,
  GET_BOOKS,
  GET_BOOK_LOANS,
  GET_CLASSES,
  GET_DASHBOARD_COUNTS,
  GET_EVENTS,
  GET_EXAMS,
  GET_LESSONS,
  GET_PARENTS,
  GET_RESULTS,
  GET_STUDENTS,
  GET_SUBJECTS,
  GET_TEACHERS,
  GET_WEEKLY_ATTENDANCE,
  GET_SCHEDULE,
  GET_STUDENT,
  GET_TEACHER,
    GET_FEE_STRUCTURES,
  GET_INVOICES,
  GET_DEFAULTERS,
  GET_FEE_SUMMARY,
  GET_SCHOLARSHIPS,
   GET_TEACHER_ATTENDANCES,
  GET_STAFF_ATTENDANCES,
  GET_LEAVES,
  GET_GRADES,
  GET_AUDIT_LOGS,
  GET_MY_CHILDREN,
    GET_VEHICLES,
  GET_MY_VEHICLES,
  GET_ROUTES,
  GET_ROUTE,
  ME_QUERY,
  MY_PERMISSIONS,
  GET_MY_INSTITUTION,
  GET_PERMISSIONS,
  GET_CUSTOM_ROLES,
  GET_CUSTOM_ROLE,
   GET_ACADEMIC_YEARS,
  GET_DEPARTMENTS,
} from "./queries";

export async function getMe() {
  try {
    const client = getServerClient();
    const data = await client.request<{ me: any }>(ME_QUERY, {});
    return data.me;
  } catch (err) {
    console.error("getMe failed:", err);
    return null;
  }
}

export async function getMyInstitution() {
  // The platform owner (super admin) belongs to no institution.
  if (getServerRole() === "super_admin") return null;
  try {
    const client = getServerClient();
    const data = await client.request<{ myInstitution: any }>(GET_MY_INSTITUTION, {});
    return data.myInstitution;
  } catch (err) {
    console.error("getMyInstitution failed:", err);
    return null;
  }
}
/** Formats an ISO date string the same way the original dummy data did: "2025-01-01". */
function fmtDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toISOString().split("T")[0];
}

function fmtTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export async function getDashboardCounts() {
  try {
    const client = getServerClient();
    const data = await client.request<{
      dashboardCounts: {
        studentCount: number;
        teacherCount: number;
        parentCount: number;
        adminCount: number;
        boysCount: number;
        girlsCount: number;
      };
    }>(GET_DASHBOARD_COUNTS, {});
    return data.dashboardCounts;
  } catch (err) {
    console.error("getDashboardCounts failed:", err);
    return {
      studentCount: 0,
      teacherCount: 0,
      parentCount: 0,
      adminCount: 0,
      boysCount: 0,
      girlsCount: 0,
    };
  }
}

export async function getWeeklyAttendance() {
  try {
    const client = getServerClient();
    const data = await client.request<{
      weeklyAttendance: { day: string; present: number; absent: number }[];
    }>(GET_WEEKLY_ATTENDANCE, {});
    return data.weeklyAttendance;
  } catch (err) {
    console.error("getWeeklyAttendance failed:", err);
    return [];
  }
}
// Every fetcher swallows GraphQL/network errors and returns an empty
// list rather than throwing, so a page still renders (with an empty
// table) if the backend is unreachable, instead of crashing the whole
// Server Component tree.
export async function getSubjects(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ subjects: any[] }>(GET_SUBJECTS, { search, skip, take });
    return toPaged(
      data.subjects.map((x) => (({
        id: x.id,
        name: x.name,
        code: x.code ?? "-",
        type: x.type ?? "THEORY",
        credit: x.credit ?? null,
        isOptional: x.isOptional ?? false,
        isFourthSubject: x.isFourthSubject ?? false,
        teachers: x.teachers ?? [],
      }))),
      p,
    );
  } catch (err) {
    console.error("getSubjects failed:", err);
    return emptyPage();
  }
}



export const STUDENTS_PAGE_SIZE = 10;

export async function getStudents(search?: string, page = 1, status?: string) {
  try {
    const client = getServerClient();
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * STUDENTS_PAGE_SIZE;
    const data = await client.request<{ students: any[] }>(GET_STUDENTS, {
      status: status || undefined,
      search,
      skip,
      take: STUDENTS_PAGE_SIZE + 1,
    });

    const hasNextPage = data.students.length > STUDENTS_PAGE_SIZE;
    const pageRows = data.students.slice(0, STUDENTS_PAGE_SIZE);

    const students = pageRows.map((s) => ({
      id: s.id,
      studentId: s.id,
      name: `${s.name} ${s.surname}`,
      email: s.email,
      photo: s.img || "/avatar.png",
      phone: s.phone ?? "-",
      address: s.address ?? "-",
      classId: s.classId,
      class: s.className ?? "-",
      gradeId: s.gradeId,
      grade: s.gradeLevel ?? "-",
      parentId: s.parentId,
      parent: s.parentName ?? "-",
      status: s.status ?? "ACTIVE",
    }));

    return { students, hasNextPage, page: safePage };
  } catch (err) {
    console.error("getStudents failed:", err);
    return { students: [], hasNextPage: false, page: 1 };
  }
}

export async function getStudent(id: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ student: any }>(GET_STUDENT, { id });
    const s = data.student;
    return {
      id: s.id,
      name: `${s.name} ${s.surname}`,
      email: s.email,
      photo: s.img || "/avatar.png",
      phone: s.phone ?? "-",
      address: s.address ?? "-",
      bloodType: s.bloodType ?? "-",
      sex: s.sex ?? null,
      birthday: fmtDate(s.birthday),
      classId: s.classId,
      className: s.className ?? "-",
      gradeId: s.gradeId,
      gradeLevel: s.gradeLevel ?? "-",
      parentId: s.parentId,
      parentName: s.parentName ?? "-",
      status: s.status ?? "ACTIVE",
    };
  } catch (err) {
    console.error("getStudent failed:", err);
    return null;
  }
}
export async function getParents(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ parents: any[] }>(GET_PARENTS, { search, skip, take });
    return toPaged(
      data.parents.map((x) => (({
        id: x.id,
        name: `${x.name} ${x.surname}`,
        email: x.email,
        students: x.students ?? [],
        phone: x.phone ?? "-",
        address: x.address ?? "-",
      }))),
      p,
    );
  } catch (err) {
    console.error("getParents failed:", err);
    return emptyPage();
  }
}

export async function getBooks(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page, LARGE_PAGE_SIZE);
    const data = await client.request<{ books: any[] }>(GET_BOOKS, { search, skip, take });
    return toPaged(
      data.books.map((x) => (({
        id: x.id,
        title: x.title,
        author: x.author,
        isbn: x.isbn,
        category: x.category ?? "-",
        totalCopies: x.totalCopies,
        availableCopies: x.availableCopies,
      }))),
      p, LARGE_PAGE_SIZE,
    );
  } catch (err) {
    console.error("getBooks failed:", err);
    return emptyPage();
  }
}
export async function getBookLoans(status?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page, LARGE_PAGE_SIZE);
    const data = await client.request<{ bookLoans: any[] }>(GET_BOOK_LOANS, { status, skip, take });
    return toPaged(
      data.bookLoans.map((x) => (({
        id: x.id,
        status: x.status,
        borrowedAt: fmtDate(x.borrowedAt),
        dueDate: fmtDate(x.dueDate),
        returnedAt: x.returnedAt ? fmtDate(x.returnedAt) : "-",
        fineAmount: x.fineAmount ?? 0,
        bookId: x.bookId,
        borrowerId: x.borrowerId,
        bookTitle: x.bookTitle ?? "-",
        borrowerName: x.borrowerName ?? "-",
      }))),
      p, LARGE_PAGE_SIZE,
    );
  } catch (err) {
    console.error("getBookLoans failed:", err);
    return emptyPage();
  }
}
export async function getClasses(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ classes: any[] }>(GET_CLASSES, { search, skip, take });
    return toPaged(
      data.classes.map((x) => (({
        id: x.id,
        name: x.name,
        capacity: x.capacity,
        section: x.section ?? "-",
        room: x.room ?? "-",
        gradeId: x.gradeId,
        grade: x.gradeLevel ?? "-",
        supervisorId: x.supervisorId ?? null,
        supervisor: x.supervisorName ?? "-",
        departmentId: x.departmentId ?? null,
        department: x.departmentName ?? "-",
      }))),
      p,
    );
  } catch (err) {
    console.error("getClasses failed:", err);
    return emptyPage();
  }
}

export async function getLessons(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ lessons: any[] }>(GET_LESSONS, { skip, take });
    return toPaged(
      data.lessons.map((x) => (({
        id: x.id,
        subject: x.subjectName ?? "-",
        class: x.className ?? "-",
        teacher: x.teacherName ?? "-",
      }))),
      p,
    );
  } catch (err) {
    console.error("getLessons failed:", err);
    return emptyPage();
  }
}

export async function getExams(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ exams: any[] }>(GET_EXAMS, { skip, take });
    return toPaged(
      data.exams.map((x) => (({
        id: x.id,
        subject: x.subjectName ?? "-",
        examType: x.examType ?? "CLASS_TEST",
        class: x.className ?? "-",
        teacher: x.teacherName ?? "-",
        date: fmtDate(x.startTime),
      }))),
      p,
    );
  } catch (err) {
    console.error("getExams failed:", err);
    return emptyPage();
  }
}

export async function getAssignments(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ assignments: any[] }>(GET_ASSIGNMENTS, { skip, take });
    return toPaged(
      data.assignments.map((x) => (({
        id: x.id,
        subject: x.subjectName ?? "-",
        class: x.className ?? "-",
        teacher: x.teacherName ?? "-",
        dueDate: fmtDate(x.dueDate),
      }))),
      p,
    );
  } catch (err) {
    console.error("getAssignments failed:", err);
    return emptyPage();
  }
}

export async function getResults(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ results: any[] }>(GET_RESULTS, { skip, take });
    return toPaged(
      data.results.map((x) => (({
        id: x.id,
        subject: x.subjectName ?? "-",
        class: x.className ?? "-",
        teacher: x.teacherName ?? "-",
        student: x.studentName ?? "-",
        type: x.type ?? "exam",
        date: fmtDate(x.date),
        score: x.score,
      }))),
      p,
    );
  } catch (err) {
    console.error("getResults failed:", err);
    return emptyPage();
  }
}

export async function getAttendances(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page, LARGE_PAGE_SIZE);
    const data = await client.request<{ attendances: any[] }>(GET_ATTENDANCES, { skip, take });
    return toPaged(
      data.attendances.map((x) => (({
        id: x.id,
        date: fmtDate(x.date),
        status: x.status,
        studentId: x.studentId,
        lessonId: x.lessonId,
        student: x.studentName ?? "-",
        subject: x.subjectName ?? "-",
        class: x.className ?? "-",
        teacher: x.teacherName ?? "-",
      }))),
      p, LARGE_PAGE_SIZE,
    );
  } catch (err) {
    console.error("getAttendances failed:", err);
    return emptyPage();
  }
}

export async function getEvents(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ events: any[] }>(GET_EVENTS, { skip, take });
    return toPaged(
      data.events.map((x) => (({
        id: x.id,
        title: x.title,
        description: x.description ?? "",
        class: x.className ?? "-",
        date: fmtDate(x.startTime),
        startTime: fmtTime(x.startTime),
        endTime: fmtTime(x.endTime),
      }))),
      p,
    );
  } catch (err) {
    console.error("getEvents failed:", err);
    return emptyPage();
  }
}

export async function getAnnouncements(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ announcements: any[] }>(GET_ANNOUNCEMENTS, { skip, take });
    return toPaged(
      data.announcements.map((x) => (({
        id: x.id,
        title: x.title,
        body: x.description ?? "",
        class: x.className ?? "-",
        date: fmtDate(x.date),
      }))),
      p,
    );
  } catch (err) {
    console.error("getAnnouncements failed:", err);
    return emptyPage();
  }
}


export const TEACHERS_PAGE_SIZE = 10;

export async function getTeachers(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * TEACHERS_PAGE_SIZE;
    const data = await client.request<{ teachers: any[] }>(GET_TEACHERS, {
      search,
      skip,
      take: TEACHERS_PAGE_SIZE + 1,
    });

    const hasNextPage = data.teachers.length > TEACHERS_PAGE_SIZE;
    const pageRows = data.teachers.slice(0, TEACHERS_PAGE_SIZE);

    const teachers = pageRows.map((t) => ({
      id: t.id,
      teacherId: t.id,
      name: `${t.name} ${t.surname}`,
      email: t.email,
      photo: t.img || "/avatar.png",
      phone: t.phone ?? "-",
      subjects: t.subjects ?? [],
      subjectIds: t.subjectIds ?? [],
      classes: t.classes ?? [],
      address: t.address ?? "-",
    }));

    return { teachers, hasNextPage, page: safePage };
  } catch (err) {
    console.error("getTeachers failed:", err);
    return { teachers: [], hasNextPage: false, page: 1 };
  }
}

export async function getTeacher(id: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ teacher: any }>(GET_TEACHER, { id });
    const t = data.teacher;
    return {
      id: t.id,
      name: `${t.name} ${t.surname}`,
      email: t.email,
      photo: t.img || "/avatar.png",
      phone: t.phone ?? "-",
      address: t.address ?? "-",
      bloodType: t.bloodType ?? "-",
      sex: t.sex ?? null,
      birthday: fmtDate(t.birthday),
      subjects: t.subjects ?? [],
      subjectIds: t.subjectIds ?? [],
      classes: t.classes ?? [],
    };
  } catch (err) {
    console.error("getTeacher failed:", err);
    return null;
  }
}



/** All lessons for one teacher, shaped for BigCalendar's {title, start, end}. */
export async function getTeacherSchedule(teacherId: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ lessons: any[] }>(GET_SCHEDULE, {});
    return data.lessons
      .filter((l) => l.teacherId === teacherId)
      .map((l) => ({
        title: `${l.subjectName ?? l.name}`,
        start: new Date(l.startTime),
        end: new Date(l.endTime),
      }));
  } catch (err) {
    console.error("getTeacherSchedule failed:", err);
    return [];
  }
}

/** All lessons for one class, shaped for BigCalendar's {title, start, end}. */
export async function getClassSchedule(classId: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ lessons: any[] }>(GET_SCHEDULE, {});
    return data.lessons
      .filter((l) => l.classId === classId)
      .map((l) => ({
        title: `${l.subjectName ?? l.name}`,
        start: new Date(l.startTime),
        end: new Date(l.endTime),
      }));
  } catch (err) {
    console.error("getClassSchedule failed:", err);
    return [];
  }
}
/**
 * The current logged-in user's own schedule. Unlike getTeacherSchedule /
 * getClassSchedule (which need an id and filter client-side), this
 * relies on the backend's own role-based visibility filter on the
 * `lessons` query — a teacher's token only ever returns their own
 * lessons, a student's/parent's token only their class(es)' lessons —
 * so no id lookup is needed on the frontend at all.
 */
export async function getMySchedule() {
  try {
    const client = getServerClient();
    const data = await client.request<{ lessons: any[] }>(GET_SCHEDULE, {});
    return data.lessons.map((l) => ({
      title: l.subjectName ?? l.name,
      start: new Date(l.startTime),
      end: new Date(l.endTime),
    }));
  } catch (err) {
    console.error("getMySchedule failed:", err);
    return [];
  }
}
export async function getFeeStructures(gradeId?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ feeStructures: any[] }>(GET_FEE_STRUCTURES, { gradeId });
    return data.feeStructures.map((f) => ({
      id: f.id,
      name: f.name,
      amount: f.amount,
      frequency: f.frequency,
      gradeId: f.gradeId,
    }));
  } catch (err) {
    console.error("getFeeStructures failed:", err);
    return [];
  }
}

export async function getInvoices(status?: string, page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page, LARGE_PAGE_SIZE);
    const data = await client.request<{ invoices: any[] }>(GET_INVOICES, { status, skip, take });
    return toPaged(
      data.invoices.map((x) => (({
        id: x.id,
        period: x.period,
        amount: x.amount,
        amountPaid: x.amountPaid,
        discountAmount: x.discountAmount,
        discountReason: x.discountReason,
        fineAmount: x.fineAmount,
        fineReason: x.fineReason,
        payableAmount: x.payableAmount,
        balance: x.balance,
        dueDate: fmtDate(x.dueDate),
        status: x.status,
        studentId: x.studentId,
        studentName: x.studentName ?? "-",
      }))),
      p, LARGE_PAGE_SIZE,
    );
  } catch (err) {
    console.error("getInvoices failed:", err);
    return emptyPage();
  }
}

export async function getScholarships(studentId?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ scholarships: any[] }>(GET_SCHOLARSHIPS, { studentId });
    return data.scholarships.map((s: any) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      value: s.value,
      active: s.active,
      startDate: fmtDate(s.startDate),
      endDate: s.endDate ? fmtDate(s.endDate) : null,
      notes: s.notes,
      studentId: s.studentId,
      studentName: s.student ? `${s.student.name} ${s.student.surname}` : (s.studentName ?? "-"),
    }));
  } catch (err) {
    console.error("getScholarships failed:", err);
    return [];
  }
}

export async function getDefaulters() {
  try {
    const client = getServerClient();
    const data = await client.request<{ defaulters: any[] }>(GET_DEFAULTERS, {});
    return data.defaulters.map((i) => ({
      id: i.id,
      period: i.period,
      amount: i.amount,
      amountPaid: i.amountPaid,
      balance: i.balance,
      dueDate: fmtDate(i.dueDate),
      status: i.status,
      studentName: i.studentName ?? "-",
    }));
  } catch (err) {
    console.error("getDefaulters failed:", err);
    return [];
  }
}

export async function getFeeSummary() {
  try {
    const client = getServerClient();
    const data = await client.request<{ feeCollectionSummary: any }>(GET_FEE_SUMMARY, {});
    return data.feeCollectionSummary;
  } catch (err) {
    console.error("getFeeSummary failed:", err);
    return { totalInvoiced: 0, totalCollected: 0, totalPending: 0, invoiceCount: 0, paidCount: 0, overdueCount: 0 };
  }
}

export async function getTeacherAttendances(date?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ teacherAttendances: any[] }>(GET_TEACHER_ATTENDANCES, { date });
    return data.teacherAttendances.map((a) => ({
      id: a.id,
      date: fmtDate(a.date),
      status: a.status,
      checkIn: a.checkIn ? fmtTime(a.checkIn) : "-",
      checkOut: a.checkOut ? fmtTime(a.checkOut) : "-",
      remarks: a.remarks ?? "-",
      teacherId: a.teacherId,
      teacher: a.teacherName ?? "-",
    }));
  } catch (err) {
    console.error("getTeacherAttendances failed:", err);
    return [];
  }
}

export async function getStaffAttendances(date?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ staffAttendances: any[] }>(GET_STAFF_ATTENDANCES, { date });
    return data.staffAttendances.map((a) => ({
      id: a.id,
      date: fmtDate(a.date),
      status: a.status,
      checkIn: a.checkIn ? fmtTime(a.checkIn) : "-",
      checkOut: a.checkOut ? fmtTime(a.checkOut) : "-",
      remarks: a.remarks ?? "-",
      userId: a.userId,
      staff: a.staffName ?? "-",
      role: a.staffRole ?? "-",
    }));
  } catch (err) {
    console.error("getStaffAttendances failed:", err);
    return [];
  }
}

export async function getLeaves(status?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ leaves: any[] }>(GET_LEAVES, { status });
    return data.leaves.map((l) => ({
      id: l.id,
      leaveType: l.leaveType,
      startDate: fmtDate(l.startDate),
      endDate: fmtDate(l.endDate),
      reason: l.reason,
      status: l.status,
      remarks: l.remarks ?? "-",
      appliedAt: fmtDate(l.appliedAt),
      applicantId: l.applicantId,
      applicant: l.applicantName ?? "-",
      applicantRole: l.applicantRole ?? "-",
      approvedBy: l.approvedByName ?? "-",
    }));
  } catch (err) {
    console.error("getLeaves failed:", err);
    return [];
  }
}
export async function getGrades() {
  try {
    const client = getServerClient();
    const data = await client.request<{ grades: { id: string; level: number }[] }>(GET_GRADES, {});
    return data.grades;
  } catch (err) {
    console.error("getGrades failed:", err);
    return [];
  }
}

export async function getPermissions() {
  try {
    const client = getServerClient();
    const data = await client.request<{ permissions: any[] }>(GET_PERMISSIONS, {});
    return data.permissions;
  } catch (err) {
    console.error("getPermissions failed:", err);
    return [];
  }
}

function mapRole(r: any) {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description ?? "") as string,
    isSystem: r.isSystem as boolean,
    baseRole: (r.baseRole ?? null) as string | null,
    permissionKeys: (r.permissions ?? []).map((p: { key: string }) => p.key) as string[],
  };
}

export async function getCustomRoles() {
  try {
    const client = getServerClient();
    const data = await client.request<{ customRoles: any[] }>(GET_CUSTOM_ROLES, {});
    return data.customRoles.map(mapRole);
  } catch (err) {
    console.error("getCustomRoles failed:", err);
    return [];
  }
}

export async function getCustomRole(id: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ customRole: any }>(GET_CUSTOM_ROLE, { id });
    return mapRole(data.customRole);
  } catch (err) {
    console.error("getCustomRole failed:", err);
    return null;
  }
}

export async function getAuditLogs(params?: { page?: number; userId?: string; action?: string }) {
  try {
    const client = getServerClient();
    const { page, skip, take } = pageArgs(params?.page ?? 1, LARGE_PAGE_SIZE);
    const data = await client.request<{
      auditLogs: {
        id: string;
        userId?: string;
        action: string;
        success: boolean;
        ip?: string;
        userAgent?: string;
        metadata?: string;
        createdAt: string;
      }[];
    }>(GET_AUDIT_LOGS, {
      skip,
      take,
      userId: params?.userId,
      action: params?.action,
    });
    return toPaged(data.auditLogs, page, LARGE_PAGE_SIZE);
  } catch (err) {
    console.error("getAuditLogs failed:", err);
    return emptyPage();
  }
}
export async function getMyChildren() {
  try {
    const client = getServerClient();
    const data = await client.request<{
      myChildren: { id: string; name: string; surname: string; className?: string }[];
    }>(GET_MY_CHILDREN, {});
    return data.myChildren;
  } catch (err) {
    console.error("getMyChildren failed:", err);
    return [];
  }
}
export async function getVehicles(page = 1) {
  try {
    const client = getServerClient();
    const { page: p, skip, take } = pageArgs(page);
    const data = await client.request<{ vehicles: any[] }>(GET_VEHICLES, { skip, take });
    return toPaged(
      data.vehicles.map((x) => (({
        id: x.id,
        vehicleNumber: x.vehicleNumber,
        type: x.type,
        capacity: x.capacity,
        driverName: x.driverName,
        route: x.route ?? "-",
        routeId: x.routeId,
        routeName: x.routeName ?? "-",
        status: x.status,
        transportStaffId: x.transportStaffId,
        transportStaffName: x.transportStaffName ?? "Unassigned",
      }))),
      p,
    );
  } catch (err) {
    console.error("getVehicles failed:", err);
    return emptyPage();
  }
}

export async function getRoutes() {
  try {
    const client = getServerClient();
    const data = await client.request<{ routes: any[] }>(GET_ROUTES);
    return data.routes;
  } catch (err) {
    console.error("getRoutes failed:", err);
    return [];
  }
}

export async function getRoute(id: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ route: any }>(GET_ROUTE, { id });
    return data.route;
  } catch (err) {
    console.error("getRoute failed:", err);
    return null;
  }
}

export async function getMyVehicles() {
  try {
    const client = getServerClient();
    const data = await client.request<{ myVehicles: any[] }>(GET_MY_VEHICLES, {});
    return data.myVehicles.map((v) => ({
      id: v.id,
      vehicleNumber: v.vehicleNumber,
      type: v.type,
      capacity: v.capacity,
      driverName: v.driverName,
      route: v.route ?? "-",
      status: v.status,
    }));
  } catch (err) {
    console.error("getMyVehicles failed:", err);
    return [];
  }
  
  
}
export async function getAcademicYears(): Promise<AcademicYearItem[]> {
  try {
    const client = getServerClient();
    const data = await client.request<{ academicYears: any[] }>(GET_ACADEMIC_YEARS, {});
    return data.academicYears.map((y) => ({
      id: y.id,
      name: y.name,
      startDate: y.startDate,
      endDate: y.endDate,
      isCurrent: y.isCurrent,
      terms: (y.terms ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        startDate: t.startDate,
        endDate: t.endDate,
        academicYearId: t.academicYearId,
      })),
    }));
  } catch (err) {
    console.error("getAcademicYears failed:", err);
    return [];
  }
}

export async function getDepartments(search?: string): Promise<DepartmentItem[]> {
  try {
    const client = getServerClient();
    const data = await client.request<{ departments: any[] }>(GET_DEPARTMENTS, { search });
    return data.departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code ?? null,
      type: d.type,
      description: d.description ?? null,
      classCount: d.classCount ?? 0,
    }));
  } catch (err) {
    console.error("getDepartments failed:", err);
    return [];
  }
}
export async function getExamTitles(className?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ exams: any[] }>(GET_EXAMS, { skip: 0, take: 500 });
    const titles = data.exams
      .filter((e) => !className || e.className === className)
      .map((e) => e.title as string)
      .filter(Boolean);
    return Array.from(new Set(titles)).sort();
  } catch (err) {
    console.error("getExamTitles failed:", err);
    return [];
  }
}
// null means "could not load"; callers treat that as "don't hide anything"
// (the backend still enforces every permission).
export async function getMyPermissions(): Promise<string[] | null> {
  try {
    const client = getServerClient();
    const data = await client.request<{ myPermissions: string[] }>(MY_PERMISSIONS, {});
    return data.myPermissions;
  } catch (err) {
    console.error("getMyPermissions failed:", err);
    return null;
  }
}