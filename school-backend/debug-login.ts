import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const identifier = 'teacher.jane';
  const passwordToTest = 'teacher';

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    },
  });

  if (!user) {
    console.log('❌ কোনো user পাওয়া যায়নি এই identifier দিয়ে:', identifier);
    return;
  }

  console.log('✅ User পাওয়া গেছে:', { id: user.id, username: user.username, email: user.email, role: user.role });
  console.log('DB-তে থাকা hash:', user.password);

  const candidates = ['teacher', 'teacher123', 'Teacher123', 'password', 'password123'];
  for (const candidate of candidates) {
    const match = await bcrypt.compare(candidate, user.password);
    console.log(`bcrypt.compare('${candidate}', hash) =`, match);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());