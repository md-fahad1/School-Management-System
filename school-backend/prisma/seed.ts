import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin', 10);
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

  const grade1 = await prisma.grade.upsert({
    where: { level: 1 },
    update: {},
    create: { level: 1 },
  });

  const subjectNames = ['Math', 'English', 'Science', 'Social Studies', 'Art', 'Music', 'History', 'Geography', 'Physics', 'Chemistry'];
  for (const name of subjectNames) {
    await prisma.subject.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.class.upsert({
    where: { name: '1A' },
    update: {},
    create: { name: '1A', capacity: 30, gradeId: grade1.id },
  });

  console.log('✅ Seed complete. Login with username "admin" / password "admin123".');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
