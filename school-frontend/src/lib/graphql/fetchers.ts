import "server-only";
import { getServerClient } from "./server-client";
import {
  GET_ANNOUNCEMENTS,
  GET_ASSIGNMENTS,
  GET_ATTENDANCES,
  GET_CLASSES,
  GET_EVENTS,
  GET_EXAMS,
  GET_LESSONS,
  GET_PARENTS,
  GET_RESULTS,
  GET_STUDENTS,
  GET_SUBJECTS,
  GET_TEACHERS,
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

export async function getTeachers(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ teachers: any[] }>(GET_TEACHERS, { search });
    return data.teachers.map((t) => ({
      id: t.id,
      teacherId: t.id,
      name: `${t.name} ${t.surname}`,
      email: t.email,
      photo: t.img || "/avatar.png",
      phone: t.phone ?? "-",
      subjects: t.subjects ?? [],
      classes: t.classes ?? [],
      address: t.address ?? "-",
    }));
  } catch (err) {
    console.error("getTeachers failed:", err);
    return [];
  }
}

export async function getStudents(search?: string) {
  try {
    const client = getServerClient();
    const data = await client.request<{ students: any[] }>(GET_STUDENTS, { search });
    return data.students.map((s) => ({
      id: s.id,
      studentId: s.id,
      name: `${s.name} ${s.surname}`,
      email: s.email,
      photo: s.img || "/avatar.png",
      phone: s.phone ?? "-",
      address: s.address ?? "-",
      class: s.className ?? "-",
      grade: s.gradeLevel ?? "-",
      parent: s.parentName ?? "-",
    }));
  } catch (err) {
    console.error("getStudents failed:", err);
    return [];
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
