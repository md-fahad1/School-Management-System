import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // --- Students ---
  const studentDefs = [
    { username: 'student.alex', email: 'alex.student@example.com', name: 'Alex', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis' },
    { username: 'student.mia', email: 'mia.student@example.com', name: 'Mia', surname: 'Davis', className: '1A', gradeLevel: 1, parentUsername: 'parent.davis' },
    { username: 'student.noah', email: 'noah.student@example.com', name: 'Noah', surname: 'Wilson', className: '2A', gradeLevel: 2, parentUsername: 'parent.wilson' },
    { username: 'student.emma', email: 'emma.student@example.com', name: 'Emma', surname: 'Wilson', className: '3A', gradeLevel: 3, parentUsername: 'parent.wilson' },
  ];
  const studentPassword = await bcrypt.hash('student123', 10);
  for (const s of studentDefs) {
    await prisma.user.upsert({
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
            classId: classes[s.className].id,
            gradeId: grades[s.gradeLevel].id,
            parentId: parents[s.parentUsername].id,
          },
        },
      },
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Admin:    admin / admin123');
  console.log('   Teachers: teacher.jane / teacher.mark / teacher.lisa — password: teacher123');
  console.log('   Parents:  parent.davis / parent.wilson — password: parent123');
  console.log('   Students: student.alex / student.mia / student.noah / student.emma — password: student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });