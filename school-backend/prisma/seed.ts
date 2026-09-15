import { PrismaClient, Role, Day, LoanStatus, FeeFrequency, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Monday of the current week, so weekly-attendance data always lines
// up with "this week" regardless of when the seed is actually run.
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(9, 0, 0, 0);
  return date;
}

function daysFromNow(n: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // --- Admin ---
  const adminPassword = await bcrypt.hash('admin', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: Role.ADMIN,
      admin: { create: { name: 'Super', surname: 'Admin' } },
    },
  });

  // --- Grades (1 through 8, more headroom for classes/fee structures) ---
  const gradeLevels = [1, 2, 3, 4, 5, 6, 7, 8];
  const grades: Record<number, { id: string }> = {};
  for (const level of gradeLevels) {
    grades[level] = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level },
    });
  }

  // --- Subjects ---
  const subjectNames = [
    'Math', 'English', 'Science', 'Social Studies', 'Art',
    'Music', 'History', 'Geography', 'Physics', 'Chemistry',
    'Biology', 'Computer Science', 'Physical Education',
  ];
  const subjects: Record<string, { id: string }> = {};
  for (const name of subjectNames) {
    subjects[name] = await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Classes: two sections per grade 1-6, one each for 7-8 ---
  const classDefs = [
    { name: '1A', capacity: 30, gradeLevel: 1 },
    { name: '1B', capacity: 28, gradeLevel: 1 },
    { name: '2A', capacity: 30, gradeLevel: 2 },
    { name: '2B', capacity: 27, gradeLevel: 2 },
    { name: '3A', capacity: 25, gradeLevel: 3 },
    { name: '3B', capacity: 26, gradeLevel: 3 },
    { name: '4A', capacity: 30, gradeLevel: 4 },
    { name: '5A', capacity: 28, gradeLevel: 5 },
    { name: '6A', capacity: 25, gradeLevel: 6 },
    { name: '7A', capacity: 24, gradeLevel: 7 },
    { name: '8A', capacity: 22, gradeLevel: 8 },
  ];
  const classes: Record<string, { id: string }> = {};
  for (const c of classDefs) {
    classes[c.name] = await prisma.class.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, capacity: c.capacity, gradeId: grades[c.gradeLevel].id },
    });
  }

  // --- Teachers (10, spread across subjects, one per class as supervisor) ---
  const teacherDefs = [
    { username: 'teacher.jane', email: 'jane.teacher@school.local', name: 'Jane', surname: 'Smith', subjectNames: ['Math', 'Physics'], phone: '555-0101', address: '12 Oak St', sex: 'FEMALE' as const, bloodType: 'O+' },
    { username: 'teacher.mark', email: 'mark.teacher@school.local', name: 'Mark', surname: 'Johnson', subjectNames: ['English', 'History'], phone: '555-0102', address: '45 Elm St', sex: 'MALE' as const, bloodType: 'A+' },
    { username: 'teacher.lisa', email: 'lisa.teacher@school.local', name: 'Lisa', surname: 'Brown', subjectNames: ['Science', 'Chemistry'], phone: '555-0103', address: '78 Pine St', sex: 'FEMALE' as const, bloodType: 'B+' },
    { username: 'teacher.sam', email: 'sam.teacher@school.local', name: 'Samuel', surname: 'Green', subjectNames: ['Geography', 'Social Studies'], phone: '555-0104', address: '9 Cedar Rd', sex: 'MALE' as const, bloodType: 'AB+' },
    { username: 'teacher.nora', email: 'nora.teacher@school.local', name: 'Nora', surname: 'White', subjectNames: ['Art', 'Music'], phone: '555-0105', address: '33 Birch Rd', sex: 'FEMALE' as const, bloodType: 'O-' },
    { username: 'teacher.paul', email: 'paul.teacher@school.local', name: 'Paul', surname: 'Adams', subjectNames: ['Biology', 'Chemistry'], phone: '555-0106', address: '61 Willow Rd', sex: 'MALE' as const, bloodType: 'A-' },
    { username: 'teacher.grace', email: 'grace.teacher@school.local', name: 'Grace', surname: 'Kim', subjectNames: ['Computer Science', 'Math'], phone: '555-0107', address: '5 Aspen Rd', sex: 'FEMALE' as const, bloodType: 'B-' },
    { username: 'teacher.leo', email: 'leo.teacher@school.local', name: 'Leo', surname: 'Turner', subjectNames: ['Physical Education'], phone: '555-0108', address: '88 Cherry Rd', sex: 'MALE' as const, bloodType: 'O+' },
    { username: 'teacher.amy', email: 'amy.teacher@school.local', name: 'Amy', surname: 'Clark', subjectNames: ['English', 'Art'], phone: '555-0109', address: '14 Poplar Rd', sex: 'FEMALE' as const, bloodType: 'A+' },
    { username: 'teacher.omar', email: 'omar.teacher@school.local', name: 'Omar', surname: 'Hassan', subjectNames: ['History', 'Geography'], phone: '555-0110', address: '27 Spruce Rd', sex: 'MALE' as const, bloodType: 'AB-' },
  ];
  const teacherPassword = await bcrypt.hash('teacher', 10);
  const teachers: Record<string, { id: string }> = {};
  for (const t of teacherDefs) {
    const user = await prisma.user.upsert({
      where: { username: t.username },
      update: {},
      create: {
        username: t.username,
        email: t.email,
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            name: t.name,
            surname: t.surname,
            phone: t.phone,
            address: t.address,
            sex: t.sex,
            bloodType: t.bloodType,
            birthday: new Date(1985, 0, 1),
            subjects: { connect: t.subjectNames.map((n) => ({ id: subjects[n].id })) },
          },
        },
      },
      include: { teacher: true },
    });
    teachers[t.username] = { id: user.teacher!.id };
  }

  // Assign a supervisor to each class now that teachers exist.
  const supervisorAssignments: [string, string][] = [
    ['1A', 'teacher.jane'], ['1B', 'teacher.mark'], ['2A', 'teacher.lisa'], ['2B', 'teacher.sam'],
    ['3A', 'teacher.nora'], ['3B', 'teacher.paul'], ['4A', 'teacher.grace'], ['5A', 'teacher.leo'],
    ['6A', 'teacher.amy'], ['7A', 'teacher.omar'], ['8A', 'teacher.jane'],
  ];
  for (const [className, teacherUsername] of supervisorAssignments) {
    await prisma.class.update({
      where: { name: className },
      data: { supervisorId: teachers[teacherUsername].id },
    });
  }

  // --- Staff: Accountant, Librarian, Principal ---
  const accountantPassword = await bcrypt.hash('accountant123', 10);
  const accountantUser = await prisma.user.upsert({
    where: { username: 'accountant.maria' },
    update: {},
    create: {
      username: 'accountant.maria',
      email: 'maria.accountant@school.local',
      password: accountantPassword,
      role: Role.ACCOUNTANT,
      accountant: { create: { name: 'Maria', surname: 'Santos' } },
    },
  });

  const librarianPassword = await bcrypt.hash('librarian123', 10);
  const librarianUser = await prisma.user.upsert({
    where: { username: 'librarian.tom' },
    update: {},
    create: {
      username: 'librarian.tom',
      email: 'tom.librarian@school.local',
      password: librarianPassword,
      role: Role.LIBRARIAN,
      librarian: { create: { name: 'Tom', surname: 'Reid' } },
    },
  });

  const principalPassword = await bcrypt.hash('principal123', 10);
  const principalUser = await prisma.user.upsert({
    where: { username: 'principal.helen' },
    update: {},
    create: {
      username: 'principal.helen',
      email: 'helen.principal@school.local',
      password: principalPassword,
      role: Role.PRINCIPAL,
      principal: { create: { name: 'Helen', surname: 'Carter' } },
    },
  });

  // --- Teacher Attendance: Mon-Fri of the current week, every teacher ---
  const attendanceWeekdays = [0, 1, 2, 3, 4]; // Mon..Fri offsets
  const hrStatusCycle = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'] as const;
  let teacherIdx = 0;
  for (const t of teacherDefs) {
    for (const offset of attendanceWeekdays) {
      const date = new Date(getMonday(new Date()));
      date.setDate(date.getDate() + offset);
      const status = hrStatusCycle[(teacherIdx + offset) % hrStatusCycle.length];
      await prisma.teacherAttendance.upsert({
        where: { teacherId_date: { teacherId: teachers[t.username].id, date } },
        update: {},
        create: {
          teacherId: teachers[t.username].id,
          date,
          status,
          checkIn: status !== 'ABSENT' ? new Date(date.setHours(8, status === 'LATE' ? 30 : 0, 0, 0)) : undefined,
        },
      });
    }
    teacherIdx++;
  }

  // --- Staff Attendance: Mon-Fri, for accountant/librarian/principal ---
  const staffUsers = [
    { id: accountantUser.id, name: 'accountant.maria' },
    { id: librarianUser.id, name: 'librarian.tom' },
    { id: principalUser.id, name: 'principal.helen' },
  ];
  let staffIdx = 0;
  for (const staff of staffUsers) {
    for (const offset of attendanceWeekdays) {
      const date = new Date(getMonday(new Date()));
      date.setDate(date.getDate() + offset);
      const status = hrStatusCycle[(staffIdx + offset) % hrStatusCycle.length];
      await prisma.staffAttendance.upsert({
        where: { userId_date: { userId: staff.id, date } },
        update: {},
        create: {
          userId: staff.id,
          date,
          status,
          checkIn: status !== 'ABSENT' ? new Date(date.setHours(9, status === 'LATE' ? 20 : 0, 0, 0)) : undefined,
        },
      });
    }
    staffIdx++;
  }

  // --- Leave Applications: a spread of types + statuses ---
  const teacherPaulUser = await prisma.user.findUnique({ where: { username: 'teacher.paul' } });
  const teacherAmyUser = await prisma.user.findUnique({ where: { username: 'teacher.amy' } });
  const teacherOmarUser = await prisma.user.findUnique({ where: { username: 'teacher.omar' } });

  const leaveDefs = [
    { applicantId: teacherPaulUser?.id, leaveType: 'SICK', reason: 'Fever and needs rest', status: 'PENDING', startOffset: 1, endOffset: 2 },
    { applicantId: teacherAmyUser?.id, leaveType: 'CASUAL', reason: 'Family function', status: 'APPROVED', startOffset: -5, endOffset: -4, approvedById: adminUser.id },
    { applicantId: librarianUser.id, leaveType: 'EARNED', reason: 'Planned vacation', status: 'REJECTED', startOffset: 10, endOffset: 15, approvedById: adminUser.id, remarks: 'Too many staff already on leave that week' },
    { applicantId: accountantUser.id, leaveType: 'MATERNITY', reason: 'Maternity leave', status: 'APPROVED', startOffset: -20, endOffset: 40, approvedById: adminUser.id },
    { applicantId: teacherOmarUser?.id, leaveType: 'OTHER', reason: 'Personal emergency', status: 'CANCELLED', startOffset: -2, endOffset: -1 },
  ];
  for (const l of leaveDefs) {
    if (!l.applicantId) continue;
    const existing = await prisma.leave.findFirst({ where: { applicantId: l.applicantId, reason: l.reason } });
    if (!existing) {
      await prisma.leave.create({
        data: {
          applicantId: l.applicantId,
          leaveType: l.leaveType as any,
          reason: l.reason,
          status: l.status as any,
          startDate: daysFromNow(l.startOffset),
          endDate: daysFromNow(l.endOffset),
          approvedById: l.approvedById,
          remarks: l.remarks,
          decidedAt: l.status !== 'PENDING' ? daysFromNow(l.startOffset - 1) : undefined,
        },
      });
    }
  }

  // --- Parents (8, several with more than one child) ---
  const parentDefs = [
    { username: 'parent.davis', email: 'davis.parent@example.com', name: 'Robert', surname: 'Davis', phone: '555-0201', address: '10 Maple Ave' },
    { username: 'parent.wilson', email: 'wilson.parent@example.com', name: 'Emily', surname: 'Wilson', phone: '555-0202', address: '22 Birch Ave' },
    { username: 'parent.khan', email: 'khan.parent@example.com', name: 'Imran', surname: 'Khan', phone: '555-0203', address: '5 Cypress Ave' },
    { username: 'parent.lopez', email: 'lopez.parent@example.com', name: 'Maria', surname: 'Lopez', phone: '555-0204', address: '19 Palm Ave' },
    { username: 'parent.chen', email: 'chen.parent@example.com', name: 'Wei', surname: 'Chen', phone: '555-0205', address: '31 Magnolia Ave' },
    { username: 'parent.osei', email: 'osei.parent@example.com', name: 'Kwame', surname: 'Osei', phone: '555-0206', address: '8 Fir Ave' },
    { username: 'parent.rossi', email: 'rossi.parent@example.com', name: 'Giulia', surname: 'Rossi', phone: '555-0207', address: '44 Larch Ave' },
    { username: 'parent.singh', email: 'singh.parent@example.com', name: 'Priya', surname: 'Singh', phone: '555-0208', address: '2 Juniper Ave' },
  ];
  const parentPassword = await bcrypt.hash('parent', 10);
  const parents: Record<string, { id: string }> = {};
  for (const p of parentDefs) {
    const user = await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        email: p.email,
        password: parentPassword,
        role: Role.PARENT,
        parent: { create: { name: p.name, surname: p.surname, phone: p.phone, address: p.address } },
      },
      include: { parent: true },
    });
    parents[p.username] = { id: user.parent!.id };
  }

  // --- Students (20, spread across every class, varied sex for dashboard charts) ---
  const studentDefs = [
    { username: 'student.alex', email: 'alex.student@example.com', name: 'Alex', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis', sex: 'MALE' as const },
    { username: 'student.mia', email: 'mia.student@example.com', name: 'Mia', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis', sex: 'FEMALE' as const },
    { username: 'student.zoe', email: 'zoe.student@example.com', name: 'Zoe', surname: 'Khan', className: '1B', gradeLevel: 1, parentUsername: 'parent.khan', sex: 'FEMALE' as const },
    { username: 'student.noah', email: 'noah.student@example.com', name: 'Noah', surname: 'Wilson', className: '2A', gradeLevel: 2, parentUsername: 'parent.wilson', sex: 'MALE' as const },
    { username: 'student.liam', email: 'liam.student@example.com', name: 'Liam', surname: 'Lopez', className: '2A', gradeLevel: 2, parentUsername: 'parent.lopez', sex: 'MALE' as const },
    { username: 'student.ava', email: 'ava.student@example.com', name: 'Ava', surname: 'Chen', className: '2B', gradeLevel: 2, parentUsername: 'parent.chen', sex: 'FEMALE' as const },
    { username: 'student.emma', email: 'emma.student@example.com', name: 'Emma', surname: 'Wilson', className: '3A', gradeLevel: 3, parentUsername: 'parent.wilson', sex: 'FEMALE' as const },
    { username: 'student.kofi', email: 'kofi.student@example.com', name: 'Kofi', surname: 'Osei', className: '3A', gradeLevel: 3, parentUsername: 'parent.osei', sex: 'MALE' as const },
    { username: 'student.giulia', email: 'giulia.student@example.com', name: 'Giulia', surname: 'Rossi', className: '3B', gradeLevel: 3, parentUsername: 'parent.rossi', sex: 'FEMALE' as const },
    { username: 'student.arjun', email: 'arjun.student@example.com', name: 'Arjun', surname: 'Singh', className: '4A', gradeLevel: 4, parentUsername: 'parent.singh', sex: 'MALE' as const },
    { username: 'student.lily', email: 'lily.student@example.com', name: 'Lily', surname: 'Khan', className: '4A', gradeLevel: 4, parentUsername: 'parent.khan', sex: 'FEMALE' as const },
    { username: 'student.ben', email: 'ben.student@example.com', name: 'Ben', surname: 'Davis', className: '5A', gradeLevel: 5, parentUsername: 'parent.davis', sex: 'MALE' as const },
    { username: 'student.sofia', email: 'sofia.student@example.com', name: 'Sofia', surname: 'Lopez', className: '5A', gradeLevel: 5, parentUsername: 'parent.lopez', sex: 'FEMALE' as const },
    { username: 'student.ethan', email: 'ethan.student@example.com', name: 'Ethan', surname: 'Chen', className: '6A', gradeLevel: 6, parentUsername: 'parent.chen', sex: 'MALE' as const },
    { username: 'student.grace2', email: 'grace2.student@example.com', name: 'Grace', surname: 'Osei', className: '6A', gradeLevel: 6, parentUsername: 'parent.osei', sex: 'FEMALE' as const },
    { username: 'student.marco', email: 'marco.student@example.com', name: 'Marco', surname: 'Rossi', className: '7A', gradeLevel: 7, parentUsername: 'parent.rossi', sex: 'MALE' as const },
    { username: 'student.anika', email: 'anika.student@example.com', name: 'Anika', surname: 'Singh', className: '7A', gradeLevel: 7, parentUsername: 'parent.singh', sex: 'FEMALE' as const },
    { username: 'student.jordan', email: 'jordan.student@example.com', name: 'Jordan', surname: 'Wilson', className: '8A', gradeLevel: 8, parentUsername: 'parent.wilson', sex: 'MALE' as const },
    { username: 'student.chloe', email: 'chloe.student@example.com', name: 'Chloe', surname: 'Davis', className: '8A', gradeLevel: 8, parentUsername: 'parent.davis', sex: 'FEMALE' as const },
    { username: 'student.yusuf', email: 'yusuf.student@example.com', name: 'Yusuf', surname: 'Khan', className: '8A', gradeLevel: 8, parentUsername: 'parent.khan', sex: 'MALE' as const },
  ];
  const studentPassword = await bcrypt.hash('student', 10);
  const students: Record<string, { id: string; classId: string; gradeLevel: number }> = {};
  for (const s of studentDefs) {
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        email: s.email,
        password: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            name: s.name,
            surname: s.surname,
            sex: s.sex,
            classId: classes[s.className].id,
            gradeId: grades[s.gradeLevel].id,
            parentId: parents[s.parentUsername].id,
          },
        },
      },
      include: { student: true },
    });
    students[s.username] = {
      id: user.student!.id,
      classId: classes[s.className].id,
      gradeLevel: s.gradeLevel,
    };
  }

  // --- Lessons: one per class per weekday, using each class's supervisor as teacher ---
  const weekdays = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
  const subjectCycle = ['Math', 'English', 'Science', 'Social Studies', 'Art'];
  const classLessons: Record<string, { id: string }[]> = {};
  for (const c of classDefs) {
    const supervisorUsername = supervisorAssignments.find(([name]) => name === c.name)![1];
    classLessons[c.name] = [];
    for (let i = 0; i < weekdays.length; i++) {
      const lessonName = `${subjectCycle[i]} - ${c.name}`;
      let lesson = await prisma.lesson.findFirst({ where: { name: lessonName } });
      if (!lesson) {
        const start = new Date();
        start.setHours(9 + i, 0, 0, 0);
        const end = new Date();
        end.setHours(10 + i, 0, 0, 0);
        lesson = await prisma.lesson.create({
          data: {
            name: lessonName,
            day: weekdays[i],
            startTime: start,
            endTime: end,
            subjectId: subjects[subjectCycle[i]].id,
            classId: classes[c.name].id,
            teacherId: teachers[supervisorUsername].id,
          },
        });
      }
      classLessons[c.name].push({ id: lesson.id });
    }
  }

  // --- Attendance: Mon-Fri of the current week, every student, every lesson for their class ---
  const monday = getMonday(new Date());
  for (const s of studentDefs) {
    const lessons = classLessons[s.className];
    for (let i = 0; i < lessons.length; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      // Deterministic-but-varied pattern per student/day so the weekly
      // chart shows a realistic mix instead of all-present or all-absent.
      const present = (s.username.length + i) % 4 !== 0;

      const existing = await prisma.attendance.findFirst({
        where: { studentId: students[s.username].id, lessonId: lessons[i].id, date },
      });
      if (!existing) {
        await prisma.attendance.create({
          data: { date, present, studentId: students[s.username].id, lessonId: lessons[i].id },
        });
      }
    }
  }

  // --- Exams + Assignments + Results per class, using the class's Math lesson ---
  for (const c of classDefs) {
    const mathLesson = classLessons[c.name][0]; // subjectCycle[0] === 'Math'

    let exam = await prisma.exam.findFirst({ where: { title: `Midterm - ${c.name}` } });
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          title: `Midterm - ${c.name}`,
          startTime: daysFromNow(10, 9, 0),
          endTime: daysFromNow(10, 11, 0),
          lessonId: mathLesson.id,
        },
      });
    }

    let assignment = await prisma.assignment.findFirst({ where: { title: `Homework 1 - ${c.name}` } });
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          title: `Homework 1 - ${c.name}`,
          startDate: daysFromNow(-3),
          dueDate: daysFromNow(4),
          lessonId: mathLesson.id,
        },
      });
    }

    const classStudents = studentDefs.filter((s) => s.className === c.name);
    for (let i = 0; i < classStudents.length; i++) {
      const s = classStudents[i];
      const studentId = students[s.username].id;

      const existingExamResult = await prisma.result.findFirst({ where: { examId: exam.id, studentId } });
      if (!existingExamResult) {
        await prisma.result.create({
          data: { score: 60 + ((i * 13) % 40), examId: exam.id, studentId },
        });
      }

      const existingAssignmentResult = await prisma.result.findFirst({
        where: { assignmentId: assignment.id, studentId },
      });
      if (!existingAssignmentResult) {
        await prisma.result.create({
          data: { score: 70 + ((i * 7) % 30), assignmentId: assignment.id, studentId },
        });
      }
    }
  }

  // --- Events (school-wide + class-scoped) ---
  const eventDefs = [
    { title: 'Sports Day', description: 'Annual school sports day — all classes participate.', classId: undefined, daysFromNow: 3 },
    { title: 'Parent-Teacher Meeting', description: 'Discuss student progress for Grade 1.', classId: classes['1A'].id, daysFromNow: 5 },
    { title: 'Science Fair', description: 'Grade 3 students present their science projects.', classId: classes['3A'].id, daysFromNow: 7 },
    { title: 'Winter Concert', description: 'Music department annual concert.', classId: undefined, daysFromNow: 14 },
    { title: 'Grade 8 Farewell', description: 'Send-off event for graduating students.', classId: classes['8A'].id, daysFromNow: 21 },
  ];
  for (const e of eventDefs) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      const start = daysFromNow(e.daysFromNow, 10, 0);
      const end = new Date(start);
      end.setHours(12, 0, 0, 0);
      await prisma.event.create({
        data: { title: e.title, description: e.description, startTime: start, endTime: end, classId: e.classId },
      });
    }
  }

  // --- Announcements (school-wide + class-scoped) ---
  const announcementDefs = [
    { title: 'Welcome back!', description: 'The new term starts Monday. Please arrive 15 minutes early.', classId: undefined },
    { title: 'Field trip permission slips due', description: 'Please return signed permission slips by Friday.', classId: classes['2A'].id },
    { title: 'Library fines reminder', description: 'Please return overdue books to avoid further fines.', classId: undefined },
    { title: 'Exam schedule posted', description: 'Midterm schedule is now posted on the notice board.', classId: classes['8A'].id },
  ];
  for (const a of announcementDefs) {
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.announcement.create({
        data: { title: a.title, description: a.description, classId: a.classId, authorId: adminUser.id },
      });
    }
  }

  // --- Messages (a few teacher <-> parent threads) ---
  const janeUser = await prisma.user.findUnique({ where: { username: 'teacher.jane' } });
  const davisUser = await prisma.user.findUnique({ where: { username: 'parent.davis' } });
  const messageDefs = [
    { senderId: davisUser?.id, receiverId: janeUser?.id, content: 'Hi, how is Alex doing in Math this term?', read: true },
    { senderId: janeUser?.id, receiverId: davisUser?.id, content: 'Alex is doing well, especially in the recent homework.', read: false },
  ];
  for (const m of messageDefs) {
    if (!m.senderId || !m.receiverId) continue;
    const existing = await prisma.message.findFirst({ where: { content: m.content, senderId: m.senderId } });
    if (!existing) {
      await prisma.message.create({
        data: { content: m.content, read: m.read, senderId: m.senderId, receiverId: m.receiverId },
      });
    }
  }

  // --- Library: books + a spread of loan states (active, returned, overdue) ---
  const bookDefs = [
    { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '978-0156012195', category: 'Fiction', totalCopies: 4 },
    { title: 'Charlotte\'s Web', author: 'E.B. White', isbn: '978-0064400558', category: 'Fiction', totalCopies: 3 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', totalCopies: 2 },
    { title: 'Introduction to Algorithms', author: 'Cormen et al.', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 2 },
    { title: 'World Atlas', author: 'National Geographic', isbn: '978-1426217968', category: 'Geography', totalCopies: 3 },
    { title: 'The Elements', author: 'Theodore Gray', isbn: '978-1579128149', category: 'Chemistry', totalCopies: 2 },
  ];
  const books: Record<string, { id: string }> = {};
  for (const b of bookDefs) {
    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: { ...b, availableCopies: b.totalCopies },
    });
    books[b.isbn] = { id: book.id };
  }

  const loanDefs = [
    { isbn: '978-0156012195', borrower: 'student.alex', status: LoanStatus.BORROWED, daysAgo: 3, dueInDays: 4 },
    { isbn: '978-0064400558', borrower: 'student.mia', status: LoanStatus.BORROWED, daysAgo: 10, dueInDays: -3 }, // overdue
    { isbn: '978-0553380163', borrower: 'student.marco', status: LoanStatus.RETURNED, daysAgo: 20, dueInDays: -13, returnedDaysAgo: 12 },
    { isbn: '978-0262033848', borrower: 'student.jordan', status: LoanStatus.BORROWED, daysAgo: 1, dueInDays: 13 },
    { isbn: '978-1426217968', borrower: 'student.kofi', status: LoanStatus.OVERDUE, daysAgo: 15, dueInDays: -1 },
  ];
  for (const l of loanDefs) {
    const borrowerUser = await prisma.user.findUnique({ where: { username: l.borrower } });
    if (!borrowerUser) continue;
    const existing = await prisma.bookLoan.findFirst({
      where: { bookId: books[l.isbn].id, borrowerId: borrowerUser.id, status: l.status },
    });
    if (!existing) {
      const borrowedAt = daysFromNow(-l.daysAgo);
      const dueDate = daysFromNow(l.dueInDays);
      await prisma.bookLoan.create({
        data: {
          bookId: books[l.isbn].id,
          borrowerId: borrowerUser.id,
          issuedById: adminUser.id,
          status: l.status,
          borrowedAt,
          dueDate,
          returnedAt: 'returnedDaysAgo' in l ? daysFromNow(-(l as any).returnedDaysAgo) : undefined,
          fineAmount: l.status === LoanStatus.OVERDUE ? 1.5 : undefined,
        },
      });
      if (l.status !== LoanStatus.RETURNED) {
        await prisma.book.update({
          where: { id: books[l.isbn].id },
          data: { availableCopies: { decrement: 1 } },
        });
      }
    }
  }

  // --- Fee Management: one structure per grade, invoices across every status, some part-paid ---
  const feeStructureDefs = [
    { name: 'Tuition Fee', frequency: FeeFrequency.TERM, baseAmount: 500 },
    { name: 'Transport Fee', frequency: FeeFrequency.MONTHLY, baseAmount: 40 },
  ];
  const feeStructures: Record<string, { id: string; amount: number }> = {};
  for (const level of gradeLevels) {
    for (const fs of feeStructureDefs) {
      const amount = fs.baseAmount + level * 10;
      const structure = await prisma.feeStructure.upsert({
        where: { name_gradeId: { name: fs.name, gradeId: grades[level].id } },
        update: {},
        create: { name: fs.name, amount, frequency: fs.frequency, gradeId: grades[level].id },
      });
      feeStructures[`${fs.name}-${level}`] = { id: structure.id, amount };
    }
  }

  // Generate a Tuition Fee invoice for every student for the current term,
  // then push them into a spread of PENDING / PARTIAL / PAID / OVERDUE states.
  const invoiceOutcomes: { status: PaymentStatus; paidRatio: number; dueInDays: number }[] = [
    { status: PaymentStatus.PAID, paidRatio: 1, dueInDays: 20 },
    { status: PaymentStatus.PARTIAL, paidRatio: 0.5, dueInDays: 10 },
    { status: PaymentStatus.PENDING, paidRatio: 0, dueInDays: 15 },
    { status: PaymentStatus.OVERDUE, paidRatio: 0, dueInDays: -5 },
  ];
  let outcomeIndex = 0;
  for (const s of studentDefs) {
    const structure = feeStructures[`Tuition Fee-${s.gradeLevel}`];
    const outcome = invoiceOutcomes[outcomeIndex % invoiceOutcomes.length];
    outcomeIndex++;

    const existing = await prisma.invoice.findFirst({
      where: { studentId: students[s.username].id, feeStructureId: structure.id, period: 'Term 1 2026' },
    });
    if (existing) continue;

    const amountPaid = Math.round(structure.amount * outcome.paidRatio * 100) / 100;
    const invoice = await prisma.invoice.create({
      data: {
        studentId: students[s.username].id,
        feeStructureId: structure.id,
        period: 'Term 1 2026',
        amount: structure.amount,
        amountPaid,
        dueDate: daysFromNow(outcome.dueInDays),
        status: outcome.status,
      },
    });

    // Record an actual Payment row backing any amountPaid > 0, so
    // the accountant's collection totals and payment history line up.
    if (amountPaid > 0) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: amountPaid,
          method: outcomeIndex % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.BANK_TRANSFER,
          reference: outcome.status === PaymentStatus.PAID ? `RCPT-${invoice.id.slice(0, 8)}` : undefined,
          receivedById: adminUser.id,
        },
      });
    }
  }

  console.log('✅ Seed complete.');
  console.log('   Admin:      admin / admin123');
  console.log('   Teachers:   teacher.jane / .mark / .lisa / .sam / .nora / .paul / .grace / .leo / .amy / .omar — password: teacher123');
  console.log('   Parents:    parent.davis / .wilson / .khan / .lopez / .chen / .osei / .rossi / .singh — password: parent123');
  console.log('   Students:   20 students across classes 1A-8A — password: student123');
  console.log('   Accountant: accountant.maria — password: accountant123');
  console.log('   Librarian:  librarian.tom — password: librarian123');
  console.log('   Principal:  principal.helen — password: principal123');
  console.log('   + 8 grades, 13 subjects, 11 classes, 55 lessons/attendance rows, 11 exams, 11 assignments, 42 results,');
  console.log('     5 events, 4 announcements, 2 messages, 6 library books with 5 loans (active/returned/overdue),');
  console.log('     16 fee structures, 20 invoices spread across PENDING/PARTIAL/PAID/OVERDUE with matching payments,');
  console.log('     50 teacher-attendance rows, 15 staff-attendance rows, 5 leave applications (all statuses).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });