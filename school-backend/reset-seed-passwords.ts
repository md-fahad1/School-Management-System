import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Plain client (no tenant extension), same as debug-login.ts.
const prisma = new PrismaClient();

// Fixed accounts -> the password the seed documents for them.
const FIXED: Record<string, string> = {
  superadmin: 'superadmin',
  admin: 'admin123',
  'accountant.maria': 'accountant123',
  'librarian.tom': 'librarian123',
  'principal.helen': 'principal123',
};

// Groups of accounts that share one seed password.
const PREFIXES: [string, string][] = [
  ['teacher.', 'teacher123'],
  ['parent.', 'parent123'],
  ['student.', 'student123'],
];

async function check(label: string, where: object, password: string) {
  const users = await prisma.user.findMany({ where });
  if (users.length === 0) {
    console.log(`❌ ${label}: no user found (seed never ran on this database?)`);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  let fixed = 0;
  for (const u of users) {
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) {
      await prisma.user.update({ where: { id: u.id }, data: { password: hash } });
      fixed++;
    }
  }
  console.log(
    fixed === 0
      ? `✅ ${label}: ${users.length} user(s), password already correct`
      : `🔧 ${label}: ${fixed}/${users.length} user(s) had a different password, reset to "${password}"`,
  );
}

async function main() {
  for (const [username, password] of Object.entries(FIXED)) {
    await check(username, { username }, password);
  }
  for (const [prefix, password] of PREFIXES) {
    await check(`${prefix}*`, { username: { startsWith: prefix } }, password);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());