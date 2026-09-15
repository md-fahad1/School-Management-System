import "server-only";
import { getServerClient } from "./server-client";
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
   GET_TEACHER_ATTENDANCES,
  GET_STAFF_ATTENDANCES,
  GET_LEAVES,
} from "./queries";

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

export async function getSubjects(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ subjects: any[] }>(GET_SUBJECTS, { search });
    return data.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      teachers: s.teachers ?? [],
    }));
  } catch (err) {
    console.error("getSubjects failed:", err);
    return [];
  }
}



export const STUDENTS_PAGE_SIZE = 10;

export async function getStudents(search?: string, page = 1) {
  try {
    const client = getServerClient();
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * STUDENTS_PAGE_SIZE;
    const data = await client.request<{ students: any[] }>(GET_STUDENTS, {
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
    };
  } catch (err) {
    console.error("getStudent failed:", err);
    return null;
  }
}

export async function getParents(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ parents: any[] }>(GET_PARENTS, { search });
    return data.parents.map((p) => ({
      id: p.id,
      name: `${p.name} ${p.surname}`,
      email: p.email,
      students: p.students ?? [],
      phone: p.phone ?? "-",
      address: p.address ?? "-",
    }));
  } catch (err) {
    console.error("getParents failed:", err);
    return [];
  }
}
export async function getBooks(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ books: any[] }>(GET_BOOKS, { search });
    return data.books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category ?? "-",
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
    }));
  } catch (err) {
    console.error("getBooks failed:", err);
    return [];
  }
}

export async function getBookLoans(status?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ bookLoans: any[] }>(GET_BOOK_LOANS, { status });
    return data.bookLoans.map((l) => ({
      id: l.id,
      status: l.status,
      borrowedAt: fmtDate(l.borrowedAt),
      dueDate: fmtDate(l.dueDate),
      returnedAt: l.returnedAt ? fmtDate(l.returnedAt) : "-",
      fineAmount: l.fineAmount ?? 0,
      bookId: l.bookId,
      borrowerId: l.borrowerId,
      bookTitle: l.bookTitle ?? "-",
      borrowerName: l.borrowerName ?? "-",
    }));
  } catch (err) {
    console.error("getBookLoans failed:", err);
    return [];
  }
}

export async function getClasses(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ classes: any[] }>(GET_CLASSES, { search });
    return data.classes.map((c) => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      grade: c.gradeLevel ?? "-",
      supervisor: c.supervisorName ?? "-",
    }));
  } catch (err) {
    console.error("getClasses failed:", err);
    return [];
  }
}

export async function getLessons() {
  try {
    const client = getServerClient();
    const data = await client.request<{ lessons: any[] }>(GET_LESSONS, {});
    return data.lessons.map((l) => ({
      id: l.id,
      subject: l.subjectName ?? "-",
      class: l.className ?? "-",
      teacher: l.teacherName ?? "-",
    }));
  } catch (err) {
    console.error("getLessons failed:", err);
    return [];
  }
}

export async function getExams() {
  try {
    const client = getServerClient();
    const data = await client.request<{ exams: any[] }>(GET_EXAMS, {});
    return data.exams.map((e) => ({
      id: e.id,
      subject: e.subjectName ?? "-",
      class: e.className ?? "-",
      teacher: e.teacherName ?? "-",
      date: fmtDate(e.startTime),
    }));
  } catch (err) {
    console.error("getExams failed:", err);
    return [];
  }
}

export async function getAssignments() {
  try {
    const client = getServerClient();
    const data = await client.request<{ assignments: any[] }>(GET_ASSIGNMENTS, {});
    return data.assignments.map((a) => ({
      id: a.id,
      subject: a.subjectName ?? "-",
      class: a.className ?? "-",
      teacher: a.teacherName ?? "-",
      dueDate: fmtDate(a.dueDate),
    }));
  } catch (err) {
    console.error("getAssignments failed:", err);
    return [];
  }
}

export async function getResults() {
  try {
    const client = getServerClient();
    const data = await client.request<{ results: any[] }>(GET_RESULTS, {});
    return data.results.map((r) => ({
      id: r.id,
      subject: r.subjectName ?? "-",
      class: r.className ?? "-",
      teacher: r.teacherName ?? "-",
      student: r.studentName ?? "-",
      type: r.type ?? "exam",
      date: fmtDate(r.date),
      score: r.score,
    }));
  } catch (err) {
    console.error("getResults failed:", err);
    return [];
  }
}

export async function getAttendances() {
  try {
    const client = getServerClient();
    const data = await client.request<{ attendances: any[] }>(GET_ATTENDANCES, {});
    return data.attendances.map((a) => ({
      id: a.id,
      date: fmtDate(a.date),
      present: a.present,
      studentId: a.studentId,
      lessonId: a.lessonId,
      student: a.studentName ?? "-",
      subject: a.subjectName ?? "-",
      class: a.className ?? "-",
      teacher: a.teacherName ?? "-",
    }));
  } catch (err) {
    console.error("getAttendances failed:", err);
    return [];
  }
}

export async function getEvents() {
  try {
    const client = getServerClient();
    const data = await client.request<{ events: any[] }>(GET_EVENTS, {});
    return data.events.map((e) => ({
      id: e.id,
      title: e.title,
      class: e.className ?? "-",
      date: fmtDate(e.startTime),
      startTime: fmtTime(e.startTime),
      endTime: fmtTime(e.endTime),
    }));
  } catch (err) {
    console.error("getEvents failed:", err);
    return [];
  }
}

export async function getAnnouncements() {
  try {
    const client = getServerClient();
    const data = await client.request<{ announcements: any[] }>(GET_ANNOUNCEMENTS, {});
    return data.announcements.map((a) => ({
      id: a.id,
      title: a.title,
      class: a.className ?? "-",
      date: fmtDate(a.date),
    }));
  } catch (err) {
    console.error("getAnnouncements failed:", err);
    return [];
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

export async function getInvoices(status?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ invoices: any[] }>(GET_INVOICES, { status, take: 100 });
    return data.invoices.map((i) => ({
      id: i.id,
      period: i.period,
      amount: i.amount,
      amountPaid: i.amountPaid,
      balance: i.balance,
      dueDate: fmtDate(i.dueDate),
      status: i.status,
      studentId: i.studentId,
      studentName: i.studentName ?? "-",
    }));
  } catch (err) {
    console.error("getInvoices failed:", err);
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

export async function getLeaves() {
  try {
    const client = getServerClient();
    const data = await client.request<{ leaves: any[] }>(GET_LEAVES, {});
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