import { PrismaClient, Role, Day } from '@prisma/client';
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

async function main() {
  // --- Admin ---
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
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

  // --- Grades ---
  const gradeLevels = [1, 2, 3, 4, 5, 6];
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
  ];
  const subjects: Record<string, { id: string }> = {};
  for (const name of subjectNames) {
    subjects[name] = await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Classes ---
  const classDefs = [
    { name: '1A', capacity: 30, gradeLevel: 1 },
    { name: '2A', capacity: 30, gradeLevel: 2 },
    { name: '3A', capacity: 25, gradeLevel: 3 },
  ];
  const classes: Record<string, { id: string }> = {};
  for (const c of classDefs) {
    classes[c.name] = await prisma.class.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, capacity: c.capacity, gradeId: grades[c.gradeLevel].id },
    });
  }

  // --- Teachers ---
  const teacherDefs = [
    { username: 'teacher.jane', email: 'jane.teacher@school.local', name: 'Jane', surname: 'Smith', subjectNames: ['Math', 'Physics'], phone: '555-0101', address: '12 Oak St' },
    { username: 'teacher.mark', email: 'mark.teacher@school.local', name: 'Mark', surname: 'Johnson', subjectNames: ['English', 'History'], phone: '555-0102', address: '45 Elm St' },
    { username: 'teacher.lisa', email: 'lisa.teacher@school.local', name: 'Lisa', surname: 'Brown', subjectNames: ['Science', 'Chemistry'], phone: '555-0103', address: '78 Pine St' },
  ];
  const teacherPassword = await bcrypt.hash('teacher123', 10);
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
            subjects: { connect: t.subjectNames.map((n) => ({ id: subjects[n].id })) },
          },
        },
      },
      include: { teacher: true },
    });
    teachers[t.username] = { id: user.teacher!.id };
  }

  // Assign a supervisor to each class now that teachers exist.
  await prisma.class.update({ where: { name: '1A' }, data: { supervisorId: teachers['teacher.jane'].id } });
  await prisma.class.update({ where: { name: '2A' }, data: { supervisorId: teachers['teacher.mark'].id } });
  await prisma.class.update({ where: { name: '3A' }, data: { supervisorId: teachers['teacher.lisa'].id } });

  // --- Parents ---
  const parentDefs = [
    { username: 'parent.davis', email: 'davis.parent@example.com', name: 'Robert', surname: 'Davis', phone: '555-0201', address: '10 Maple Ave' },
    { username: 'parent.wilson', email: 'wilson.parent@example.com', name: 'Emily', surname: 'Wilson', phone: '555-0202', address: '22 Birch Ave' },
  ];
  const parentPassword = await bcrypt.hash('parent123', 10);
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

  // --- Students (now with sex set, so the boys/girls dashboard chart has real data) ---
  const studentDefs = [
    { username: 'student.alex', email: 'alex.student@example.com', name: 'Alex', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis', sex: 'MALE' as const },
    { username: 'student.mia', email: 'mia.student@example.com', name: 'Mia', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis', sex: 'FEMALE' as const },
    { username: 'student.noah', email: 'noah.student@example.com', name: 'Noah', surname: 'Wilson', className: '2A', gradeLevel: 2, parentUsername: 'parent.wilson', sex: 'MALE' as const },
    { username: 'student.emma', email: 'emma.student@example.com', name: 'Emma', surname: 'Wilson', className: '3A', gradeLevel: 3, parentUsername: 'parent.wilson', sex: 'FEMALE' as const },
  ];
  const studentPassword = await bcrypt.hash('student123', 10);
  const students: Record<string, { id: string; classId: string }> = {};
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
    students[s.username] = { id: user.student!.id, classId: classes[s.className].id };
  }

  // --- Lessons (needed for Exams/Assignments/Attendance, none existed before) ---
  const lessonDefs = [
    { name: 'Math - 1A', day: Day.MONDAY, subject: 'Math', className: '1A', teacher: 'teacher.jane' },
    { name: 'English - 2A', day: Day.TUESDAY, subject: 'English', className: '2A', teacher: 'teacher.mark' },
    { name: 'Science - 3A', day: Day.WEDNESDAY, subject: 'Science', className: '3A', teacher: 'teacher.lisa' },
  ];
  const lessons: Record<string, { id: string; classId: string }> = {};
  for (const l of lessonDefs) {
    let lesson = await prisma.lesson.findFirst({ where: { name: l.name } });
    if (!lesson) {
      const start = new Date();
      start.setHours(9, 0, 0, 0);
      const end = new Date();
      end.setHours(10, 0, 0, 0);
      lesson = await prisma.lesson.create({
        data: {
          name: l.name,
          day: l.day,
          startTime: start,
          endTime: end,
          subjectId: subjects[l.subject].id,
          classId: classes[l.className].id,
          teacherId: teachers[l.teacher].id,
        },
      });
    }
    lessons[l.className] = { id: lesson.id, classId: classes[l.className].id };
  }

  // --- Attendance: Mon-Fri of the current week, per student, varied present/absent ---
  const monday = getMonday(new Date());
  // A simple varied pattern so the weekly chart doesn't look flat —
  // not meant to represent anything real, just realistic-looking demo data.
  const attendancePattern: Record<string, boolean[]> = {
    'student.alex': [true, true, false, true, true],
    'student.mia': [true, false, true, true, true],
    'student.noah': [true, true, true, false, true],
    'student.emma': [false, true, true, true, false],
  };
  for (const s of studentDefs) {
    const lesson = lessons[s.className];
    if (!lesson) continue;
    const pattern = attendancePattern[s.username] ?? [true, true, true, true, true];

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const existing = await prisma.attendance.findFirst({
        where: { studentId: students[s.username].id, lessonId: lesson.id, date },
      });
      if (!existing) {
        await prisma.attendance.create({
          data: {
            date,
            present: pattern[i],
            studentId: students[s.username].id,
            lessonId: lesson.id,
          },
        });
      }
    }
  }

  // --- Events (school-wide + class-scoped, for the dashboard calendar) ---
  const eventDefs = [
    {
      title: 'Sports Day',
      description: 'Annual school sports day — all classes participate.',
      classId: undefined,
      daysFromNow: 3,
    },
    {
      title: 'Parent-Teacher Meeting',
      description: 'Discuss student progress for Grade 1.',
      classId: classes['1A'].id,
      daysFromNow: 5,
    },
    {
      title: 'Science Fair',
      description: 'Grade 3 students present their science projects.',
      classId: classes['3A'].id,
      daysFromNow: 7,
    },
  ];
  for (const e of eventDefs) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      const start = new Date();
      start.setDate(start.getDate() + e.daysFromNow);
      start.setHours(10, 0, 0, 0);
      const end = new Date(start);
      end.setHours(12, 0, 0, 0);
      await prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          startTime: start,
          endTime: end,
          classId: e.classId,
        },
      });
    }
  }

  // --- Announcements (school-wide + class-scoped) ---
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
  const announcementDefs = [
    { title: 'Welcome back!', description: 'The new term starts Monday. Please arrive 15 minutes early.', classId: undefined },
    { title: 'Field trip permission slips due', description: 'Please return signed permission slips by Friday.', classId: classes['2A'].id },
  ];
  for (const a of announcementDefs) {
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.announcement.create({
        data: {
          title: a.title,
          description: a.description,
          classId: a.classId,
          authorId: adminUser?.id,
        },
      });
    }
  }

  console.log('✅ Seed complete.');
  console.log('   Admin:    admin / admin123');
  console.log('   Teachers: teacher.jane / teacher.mark / teacher.lisa — password: teacher123');
  console.log('   Parents:  parent.davis / parent.wilson — password: parent123');
  console.log('   Students: student.alex / student.mia / student.noah / student.emma — password: student123');
  console.log('   + 3 lessons, 20 attendance records (this week), 3 events, 2 announcements');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });