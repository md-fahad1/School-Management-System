import { PrismaClient, Role, Day, LoanStatus, FeeFrequency, PaymentStatus, PaymentMethod, AttendanceStatus, DepartmentType, TermType, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { tenantExtension } from '../src/tenant/tenant-extension';
import { tenantStorage } from '../src/tenant/tenant-context';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../src/common/constants/permissions.constant';

const basePrisma = new PrismaClient({ log: [{ emit: 'event', level: 'query' }] });
let queryCount = 0;
(basePrisma as any).$on('query', () => {
  if (++queryCount % 50 === 0) console.log(`... ${queryCount} queries so far`);
});
// Extended client: inside tenantStorage.run(...) every query is scoped to one institution.
const prisma = basePrisma.$extends(tenantExtension());

// Seeds the Permission catalog + one isSystem CustomRole per legacy Role
// enum value, pre-populated with that role's default permissions. These
// system roles are just a DB-backed mirror of DEFAULT_ROLE_PERMISSIONS —
// admins can clone one to build a custom role from, or edit it directly.
async function seedPermissions() {
  // Permissions and system roles are global (institutionId = null), so use the
  // un-scoped client. The tenant extension would stamp them with the demo school's id.
  const prisma = basePrisma;
  const permissionRecords: Record<string, { id: string }> = {};
  for (const p of PERMISSIONS) {
    const rec = await prisma.permission.upsert({
      where: { key: p.key },
      update: { module: p.module, action: p.action, description: p.description },
      create: p,
    });
    permissionRecords[p.key] = { id: rec.id };
  }

  for (const roleName of Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[]) {
    // (institutionId, name) is unique, but NULL never equals NULL in a unique
    // index, so system roles (institutionId = null) can't use upsert().
    const found = await prisma.customRole.findFirst({ where: { name: roleName, institutionId: null } });
    const role = found
      ? await prisma.customRole.update({ where: { id: found.id }, data: { baseRole: roleName, isSystem: true } })
      : await prisma.customRole.create({
          data: { name: roleName, description: `System default role for ${roleName}`, isSystem: true, baseRole: roleName },
        });

    for (const key of DEFAULT_ROLE_PERMISSIONS[roleName]) {
      const permission = permissionRecords[key];
      if (!permission) continue;
      await prisma.customRolePermission.upsert({
        where: { customRoleId_permissionId: { customRoleId: role.id, permissionId: permission.id } },
        update: {},
        create: { customRoleId: role.id, permissionId: permission.id },
      });
    }
  }
}

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
  // --- Platform owner (belongs to no institution) ---
  await basePrisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@gmail.com',
      password: await bcrypt.hash('superadmin', 10),
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  // --- Demo institution; all demo data below is created inside it ---
  const institution = await basePrisma.institution.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: { name: 'Demo School', slug: 'demo-school' },
  });

  await tenantStorage.run(
    { institutionId: institution.id, isSuperAdmin: false, anonymous: false },
    () => seedDemoSchool(institution.id),
  );
}

async function seedDemoSchool(institutionId: string) {
  await seedPermissions();

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
      admin: { create: { name: 'Md. Abdullah', surname: 'Al Mamun' } },
    },
  });

  // --- Grades (1 through 8, more headroom for classes/fee structures) ---
  const gradeLevels = [1, 2, 3, 4, 5, 6, 7, 8];
  const grades: Record<number, { id: string }> = {};
  for (const level of gradeLevels) {
    grades[level] = await prisma.grade.upsert({
      where: { institutionId_level: { institutionId, level } },
      update: {},
      create: { level, institutionId },
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
      where: { institutionId_name: { institutionId, name } },
      update: {},
      create: { name, institutionId },
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
      where: { institutionId_name: { institutionId, name: c.name } },
      update: {},
      create: { name: c.name, capacity: c.capacity, gradeId: grades[c.gradeLevel].id, institutionId },
    });
  }

  // --- Departments & Groups: school groups (Science/Humanities/Business Studies) + one college-style department ---
  const departmentDefs = [
    { name: 'Science', code: 'SCI', type: DepartmentType.GROUP, description: 'Science group — Physics, Chemistry, Biology and Higher Math.' },
    { name: 'Humanities', code: 'HUM', type: DepartmentType.GROUP, description: 'Humanities group — History, Geography, Civics and Social Science.' },
    { name: 'Business Studies', code: 'BUS', type: DepartmentType.GROUP, description: 'Business Studies group — Accounting, Business Organization and Economics.' },
    { name: 'Computer Science & Engineering', code: 'CSE', type: DepartmentType.DEPARTMENT, description: 'College-level department for CSE students.' },
  ];
  const departments: Record<string, { id: string }> = {};
  for (const d of departmentDefs) {
    departments[d.name] = await prisma.department.upsert({
      where: { institutionId_name: { institutionId, name: d.name } },
      update: {},
      create: { name: d.name, code: d.code, type: d.type, description: d.description, institutionId },
    });
  }

  // Assign a couple of upper classes to a group, just so the assignment shows up in the UI.
  await prisma.class.update({ where: { institutionId_name: { institutionId, name: '7A' } }, data: { departmentId: departments['Science'].id } });
  await prisma.class.update({ where: { institutionId_name: { institutionId, name: '8A' } }, data: { departmentId: departments['Humanities'].id } });

  // --- Academic Year + Terms ---
  const currentYear = new Date().getFullYear();
  const academicYear = await prisma.academicYear.upsert({
    where: { institutionId_name: { institutionId, name: `${currentYear}` } },
    update: {},
    create: {
      institutionId,
      name: `${currentYear}`,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
      isCurrent: true,
    },
  });
  const termDefs = [
    { name: '1st Term', type: TermType.TERM, startDate: new Date(currentYear, 0, 1), endDate: new Date(currentYear, 3, 30) },
    { name: '2nd Term', type: TermType.TERM, startDate: new Date(currentYear, 4, 1), endDate: new Date(currentYear, 7, 31) },
    { name: '3rd Term', type: TermType.TERM, startDate: new Date(currentYear, 8, 1), endDate: new Date(currentYear, 11, 31) },
  ];
  for (const t of termDefs) {
    const existing = await prisma.term.findFirst({ where: { academicYearId: academicYear.id, name: t.name } });
    if (!existing) {
      await prisma.term.create({
        data: { name: t.name, type: t.type, startDate: t.startDate, endDate: t.endDate, academicYearId: academicYear.id },
      });
    }
  }

  // --- Teachers (10, spread across subjects, one per class as supervisor) ---
  const teacherDefs = [
    { username: 'teacher.rahim', email: 'rahim.teacher@school.local', name: 'Md. Abdur', surname: 'Rahim', subjectNames: ['Math', 'Physics'], phone: '+8801711001101', address: 'Dhanmondi, Dhaka', sex: 'MALE' as const, bloodType: 'O+' },
    { username: 'teacher.karim', email: 'karim.teacher@school.local', name: 'Abdul', surname: 'Karim', subjectNames: ['English', 'History'], phone: '+8801711001102', address: 'Mirpur, Dhaka', sex: 'MALE' as const, bloodType: 'A+' },
    { username: 'teacher.fatema', email: 'fatema.teacher@school.local', name: 'Fatema', surname: 'Begum', subjectNames: ['Science', 'Chemistry'], phone: '+8801711001103', address: 'Uttara, Dhaka', sex: 'FEMALE' as const, bloodType: 'B+' },
    { username: 'teacher.jasim', email: 'jasim.teacher@school.local', name: 'Jasim', surname: 'Uddin', subjectNames: ['Geography', 'Social Studies'], phone: '+8801711001104', address: 'Mohammadpur, Dhaka', sex: 'MALE' as const, bloodType: 'AB+' },
    { username: 'teacher.nasrin', email: 'nasrin.teacher@school.local', name: 'Nasrin', surname: 'Akter', subjectNames: ['Art', 'Music'], phone: '+8801711001105', address: 'Banani, Dhaka', sex: 'FEMALE' as const, bloodType: 'O-' },
    { username: 'teacher.mizan', email: 'mizan.teacher@school.local', name: 'Mizanur', surname: 'Rahman', subjectNames: ['Biology', 'Chemistry'], phone: '+8801711001106', address: 'Bashundhara, Dhaka', sex: 'MALE' as const, bloodType: 'A-' },
    { username: 'teacher.shirin', email: 'shirin.teacher@school.local', name: 'Shirin', surname: 'Sultana', subjectNames: ['Computer Science', 'Math'], phone: '+8801711001107', address: 'Rampura, Dhaka', sex: 'FEMALE' as const, bloodType: 'B-' },
    { username: 'teacher.kamal', email: 'kamal.teacher@school.local', name: 'Kamal', surname: 'Hossain', subjectNames: ['Physical Education'], phone: '+8801711001108', address: 'Farmgate, Dhaka', sex: 'MALE' as const, bloodType: 'O+' },
    { username: 'teacher.ruma', email: 'ruma.teacher@school.local', name: 'Rumana', surname: 'Islam', subjectNames: ['English', 'Art'], phone: '+8801711001109', address: 'Lalbagh, Dhaka', sex: 'FEMALE' as const, bloodType: 'A+' },
    { username: 'teacher.selim', email: 'selim.teacher@school.local', name: 'Selim', surname: 'Reza', subjectNames: ['History', 'Geography'], phone: '+8801711001110', address: 'Khilgaon, Dhaka', sex: 'MALE' as const, bloodType: 'AB-' },
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
    ['1A', 'teacher.rahim'], ['1B', 'teacher.karim'], ['2A', 'teacher.fatema'], ['2B', 'teacher.jasim'],
    ['3A', 'teacher.nasrin'], ['3B', 'teacher.mizan'], ['4A', 'teacher.shirin'], ['5A', 'teacher.kamal'],
    ['6A', 'teacher.ruma'], ['7A', 'teacher.selim'], ['8A', 'teacher.rahim'],
  ];
  for (const [className, teacherUsername] of supervisorAssignments) {
    await prisma.class.update({
      where: { institutionId_name: { institutionId, name: className } },
      data: { supervisorId: teachers[teacherUsername].id },
    });
  }

  // --- Staff: Accountant, Librarian, Principal ---
  const accountantPassword = await bcrypt.hash('accountant123', 10);
  const accountantUser = await prisma.user.upsert({
    where: { username: 'accountant.nasima' },
    update: {},
    create: {
      username: 'accountant.nasima',
      email: 'nasima.accountant@school.local',
      password: accountantPassword,
      role: Role.ACCOUNTANT,
      accountant: { create: { name: 'Nasima', surname: 'Khatun' } },
    },
  });

  const librarianPassword = await bcrypt.hash('librarian123', 10);
  const librarianUser = await prisma.user.upsert({
    where: { username: 'librarian.jahid' },
    update: {},
    create: {
      username: 'librarian.jahid',
      email: 'jahid.librarian@school.local',
      password: librarianPassword,
      role: Role.LIBRARIAN,
      librarian: { create: { name: 'Jahidul', surname: 'Islam' } },
    },
  });

  const principalPassword = await bcrypt.hash('principal123', 10);
  const principalUser = await prisma.user.upsert({
    where: { username: 'principal.rowshan' },
    update: {},
    create: {
      username: 'principal.rowshan',
      email: 'rowshan.principal@school.local',
      password: principalPassword,
      role: Role.PRINCIPAL,
      principal: { create: { name: 'Rowshan', surname: 'Ara' } },
    },
  });

  // --- Transport: staff, routes with stops, vehicles ---
  const transportPassword = await bcrypt.hash('transport123', 10);
  const transportStaffUser = await prisma.user.upsert({
    where: { username: 'transport.jalal' },
    update: {},
    create: {
      username: 'transport.jalal',
      email: 'jalal.transport@school.local',
      password: transportPassword,
      role: Role.TRANSPORT_STAFF,
      transportStaff: { create: { name: 'Jalal', surname: 'Uddin' } },
    },
    include: { transportStaff: true },
  });

  const routeDefs = [
    {
      name: 'Mirpur - Dhanmondi Route',
      description: 'Covers Mirpur, Mohammadpur and Dhanmondi.',
      stops: [
        { name: 'Mirpur 10', order: 1, time: '7:00 AM' },
        { name: 'Mohammadpur Bus Stand', order: 2, time: '7:20 AM' },
        { name: 'Dhanmondi 27', order: 3, time: '7:40 AM' },
      ],
    },
    {
      name: 'Uttara - Banani Route',
      description: 'Covers Uttara, Airport and Banani.',
      stops: [
        { name: 'Uttara Sector 7', order: 1, time: '7:00 AM' },
        { name: 'Airport', order: 2, time: '7:25 AM' },
        { name: 'Banani 11', order: 3, time: '7:45 AM' },
      ],
    },
  ];
  const routes: Record<string, { id: string }> = {};
  for (const r of routeDefs) {
    const route = await prisma.route.upsert({
      where: { institutionId_name: { institutionId, name: r.name } },
      update: {},
      create: { name: r.name, description: r.description, institutionId },
    });
    routes[r.name] = { id: route.id };
    for (const s of r.stops) {
      const existingStop = await prisma.stop.findFirst({ where: { routeId: route.id, name: s.name } });
      if (!existingStop) {
        await prisma.stop.create({ data: { name: s.name, order: s.order, time: s.time, routeId: route.id } });
      }
    }
  }

  const vehicleDefs = [
    { vehicleNumber: 'DHAKA-METRO-GA-11-1234', type: 'Bus', capacity: 40, driverName: 'Jalal Uddin', route: 'Mirpur - Dhanmondi Route' },
    { vehicleNumber: 'DHAKA-METRO-GA-11-5678', type: 'Microbus', capacity: 15, driverName: 'Karim Mia', route: 'Uttara - Banani Route' },
  ];
  for (const v of vehicleDefs) {
    await prisma.vehicle.upsert({
      where: { institutionId_vehicleNumber: { institutionId, vehicleNumber: v.vehicleNumber } },
      update: {},
      create: {
        vehicleNumber: v.vehicleNumber,
        type: v.type,
        capacity: v.capacity,
        driverName: v.driverName,
        route: v.route,
        routeId: routes[v.route].id,
        transportStaffId: transportStaffUser.transportStaff!.id,
        institutionId,
      },
    });
  }

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
          checkIn: status !== 'ABSENT' ? new Date(new Date(date).setHours(8, status === 'LATE' ? 30 : 0, 0, 0)) : undefined,
        },
      });
    }
    teacherIdx++;
  }

  // --- Staff Attendance: Mon-Fri, for accountant/librarian/principal ---
  const staffUsers = [
    { id: accountantUser.id, name: 'accountant.nasima' },
    { id: librarianUser.id, name: 'librarian.jahid' },
    { id: principalUser.id, name: 'principal.rowshan' },
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
          checkIn: status !== 'ABSENT' ? new Date(new Date(date).setHours(9, status === 'LATE' ? 20 : 0, 0, 0)) : undefined,
        },
      });
    }
    staffIdx++;
  }

  // --- Leave Applications: a spread of types + statuses ---
  const teacherMizanUser = await prisma.user.findUnique({ where: { username: 'teacher.mizan' } });
  const teacherRumaUser = await prisma.user.findUnique({ where: { username: 'teacher.ruma' } });
  const teacherSelimUser = await prisma.user.findUnique({ where: { username: 'teacher.selim' } });

  const leaveDefs = [
    { applicantId: teacherMizanUser?.id, leaveType: 'SICK', reason: 'Fever and needs rest', status: 'PENDING', startOffset: 1, endOffset: 2 },
    { applicantId: teacherRumaUser?.id, leaveType: 'CASUAL', reason: 'Family function', status: 'APPROVED', startOffset: -5, endOffset: -4, approvedById: adminUser.id },
    { applicantId: librarianUser.id, leaveType: 'EARNED', reason: 'Planned vacation', status: 'REJECTED', startOffset: 10, endOffset: 15, approvedById: adminUser.id, remarks: 'Too many staff already on leave that week' },
    { applicantId: accountantUser.id, leaveType: 'MATERNITY', reason: 'Maternity leave', status: 'APPROVED', startOffset: -20, endOffset: 40, approvedById: adminUser.id },
    { applicantId: teacherSelimUser?.id, leaveType: 'OTHER', reason: 'Personal emergency', status: 'CANCELLED', startOffset: -2, endOffset: -1 },
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
    { username: 'parent.hossain', email: 'hossain.parent@example.com', name: 'Abdul', surname: 'Hossain', phone: '+8801811002101', address: 'Dhanmondi, Dhaka' },
    { username: 'parent.rahman', email: 'rahman.parent@example.com', name: 'Habibur', surname: 'Rahman', phone: '+8801811002102', address: 'Mirpur, Dhaka' },
    { username: 'parent.islam', email: 'islam.parent@example.com', name: 'Nurul', surname: 'Islam', phone: '+8801811002103', address: 'Uttara, Dhaka' },
    { username: 'parent.akter', email: 'akter.parent@example.com', name: 'Salma', surname: 'Akter', phone: '+8801811002104', address: 'Mohammadpur, Dhaka' },
    { username: 'parent.chowdhury', email: 'chowdhury.parent@example.com', name: 'Farhana', surname: 'Chowdhury', phone: '+8801811002105', address: 'Banani, Dhaka' },
    { username: 'parent.sarker', email: 'sarker.parent@example.com', name: 'Kamrul', surname: 'Sarker', phone: '+8801811002106', address: 'Bashundhara, Dhaka' },
    { username: 'parent.molla', email: 'molla.parent@example.com', name: 'Aynal', surname: 'Molla', phone: '+8801811002107', address: 'Rampura, Dhaka' },
    { username: 'parent.talukder', email: 'talukder.parent@example.com', name: 'Roksana', surname: 'Talukder', phone: '+8801811002108', address: 'Farmgate, Dhaka' },
    // Fixed test account: parent / parent
    { username: 'parent', email: 'parent.test@example.com', name: 'Kamrul', surname: 'Hasan', phone: '+8801700000000', address: 'Dhaka, Bangladesh' },
  ];
  const parentPassword = await bcrypt.hash('parent123', 10);
  const testParentPassword = await bcrypt.hash('parent', 10);
  const parents: Record<string, { id: string }> = {};
  for (const p of parentDefs) {
    const user = await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        email: p.email,
        password: p.username === 'parent' ? testParentPassword : parentPassword,
        role: Role.PARENT,
        parent: { create: { name: p.name, surname: p.surname, phone: p.phone, address: p.address } },
      },
      include: { parent: true },
    });
    parents[p.username] = { id: user.parent!.id };
  }

  // --- Students (20, spread across every class, varied sex for dashboard charts) ---
  const studentDefs = [
    { username: 'student.arif', email: 'arif.student@example.com', name: 'Arif', surname: 'Hossain', className: '1A', gradeLevel: 1, parentUsername: 'parent.hossain', sex: 'MALE' as const },
    { username: 'student.nusrat', email: 'nusrat.student@example.com', name: 'Nusrat', surname: 'Hossain', className: '1A', gradeLevel: 1, parentUsername: 'parent.hossain', sex: 'FEMALE' as const },
    { username: 'student.tania', email: 'tania.student@example.com', name: 'Tania', surname: 'Islam', className: '1B', gradeLevel: 1, parentUsername: 'parent.islam', sex: 'FEMALE' as const },
    { username: 'student.rafiq', email: 'rafiq.student@example.com', name: 'Rafiq', surname: 'Rahman', className: '2A', gradeLevel: 2, parentUsername: 'parent.rahman', sex: 'MALE' as const },
    { username: 'student.rakib', email: 'rakib.student@example.com', name: 'Rakib', surname: 'Akter', className: '2A', gradeLevel: 2, parentUsername: 'parent.akter', sex: 'MALE' as const },
    { username: 'student.nabila', email: 'nabila.student@example.com', name: 'Nabila', surname: 'Chowdhury', className: '2B', gradeLevel: 2, parentUsername: 'parent.chowdhury', sex: 'FEMALE' as const },
    { username: 'student.sumaiya', email: 'sumaiya.student@example.com', name: 'Sumaiya', surname: 'Rahman', className: '3A', gradeLevel: 3, parentUsername: 'parent.rahman', sex: 'FEMALE' as const },
    { username: 'student.sabbir', email: 'sabbir.student@example.com', name: 'Sabbir', surname: 'Sarker', className: '3A', gradeLevel: 3, parentUsername: 'parent.sarker', sex: 'MALE' as const },
    { username: 'student.nishat', email: 'nishat.student@example.com', name: 'Nishat', surname: 'Molla', className: '3B', gradeLevel: 3, parentUsername: 'parent.molla', sex: 'FEMALE' as const },
    { username: 'student.arman', email: 'arman.student@example.com', name: 'Arman', surname: 'Talukder', className: '4A', gradeLevel: 4, parentUsername: 'parent.talukder', sex: 'MALE' as const },
    { username: 'student.lamia', email: 'lamia.student@example.com', name: 'Lamia', surname: 'Islam', className: '4A', gradeLevel: 4, parentUsername: 'parent.islam', sex: 'FEMALE' as const },
    { username: 'student.rahat', email: 'rahat.student@example.com', name: 'Rahat', surname: 'Hossain', className: '5A', gradeLevel: 5, parentUsername: 'parent.hossain', sex: 'MALE' as const },
    { username: 'student.sadia', email: 'sadia.student@example.com', name: 'Sadia', surname: 'Akter', className: '5A', gradeLevel: 5, parentUsername: 'parent.akter', sex: 'FEMALE' as const },
    { username: 'student.imran', email: 'imran.student@example.com', name: 'Imran', surname: 'Chowdhury', className: '6A', gradeLevel: 6, parentUsername: 'parent.chowdhury', sex: 'MALE' as const },
    { username: 'student.shathi', email: 'shathi.student@example.com', name: 'Shathi', surname: 'Sarker', className: '6A', gradeLevel: 6, parentUsername: 'parent.sarker', sex: 'FEMALE' as const },
    { username: 'student.shanto', email: 'shanto.student@example.com', name: 'Shanto', surname: 'Molla', className: '7A', gradeLevel: 7, parentUsername: 'parent.molla', sex: 'MALE' as const },
    { username: 'student.anika', email: 'anika.student@example.com', name: 'Anika', surname: 'Talukder', className: '7A', gradeLevel: 7, parentUsername: 'parent.talukder', sex: 'FEMALE' as const },
    { username: 'student.tanvir', email: 'tanvir.student@example.com', name: 'Tanvir', surname: 'Rahman', className: '8A', gradeLevel: 8, parentUsername: 'parent.rahman', sex: 'MALE' as const },
    { username: 'student.moushumi', email: 'moushumi.student@example.com', name: 'Moushumi', surname: 'Hossain', className: '8A', gradeLevel: 8, parentUsername: 'parent.hossain', sex: 'FEMALE' as const },
    { username: 'student.yeasin', email: 'yeasin.student@example.com', name: 'Yeasin', surname: 'Islam', className: '8A', gradeLevel: 8, parentUsername: 'parent.islam', sex: 'MALE' as const },
    // Fixed test account: student / student
    { username: 'student', email: 'student.test@example.com', name: 'Nayeem', surname: 'Hasan', className: '1A', gradeLevel: 1, parentUsername: 'parent', sex: 'MALE' as const },
  ];
  const studentPassword = await bcrypt.hash('student123', 10);
  const testStudentPassword = await bcrypt.hash('student', 10);
  const students: Record<string, { id: string; classId: string; gradeLevel: number }> = {};
  for (const s of studentDefs) {
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        email: s.email,
        password: s.username === 'student' ? testStudentPassword : studentPassword,
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
  const attendanceStatusCycle: AttendanceStatus[] = [
    AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
    AttendanceStatus.LATE, AttendanceStatus.ABSENT, AttendanceStatus.EXCUSED, AttendanceStatus.LEAVE,
  ];
  for (const s of studentDefs) {
    const lessons = classLessons[s.className];
    for (let i = 0; i < lessons.length; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      // Deterministic-but-varied pattern per student/day so the weekly
      // chart shows a realistic mix instead of all-present or all-absent.
      const status = attendanceStatusCycle[(s.username.length + i) % attendanceStatusCycle.length];

      const existing = await prisma.attendance.findFirst({
        where: { studentId: students[s.username].id, lessonId: lessons[i].id, date },
      });
      if (!existing) {
        await prisma.attendance.create({
          data: { date, status, studentId: students[s.username].id, lessonId: lessons[i].id },
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
        data: { title: e.title, description: e.description, startTime: start, endTime: end, classId: e.classId, institutionId },
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
        data: { title: a.title, description: a.description, classId: a.classId, authorId: adminUser.id, institutionId },
      });
    }
  }

  // --- Messages (a few teacher <-> parent threads) ---
  const rahimUser = await prisma.user.findUnique({ where: { username: 'teacher.rahim' } });
  const hossainUser = await prisma.user.findUnique({ where: { username: 'parent.hossain' } });
  const messageDefs = [
    { senderId: hossainUser?.id, receiverId: rahimUser?.id, content: 'Hi, how is Arif doing in Math this term?', read: true },
    { senderId: rahimUser?.id, receiverId: hossainUser?.id, content: 'Arif is doing well, especially in the recent homework.', read: false },
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
      where: { institutionId_isbn: { institutionId, isbn: b.isbn } },
      update: {},
      create: { ...b, availableCopies: b.totalCopies, institutionId },
    });
    books[b.isbn] = { id: book.id };
  }

  const loanDefs = [
    { isbn: '978-0156012195', borrower: 'student.arif', status: LoanStatus.BORROWED, daysAgo: 3, dueInDays: 4 },
    { isbn: '978-0064400558', borrower: 'student.nusrat', status: LoanStatus.BORROWED, daysAgo: 10, dueInDays: -3 }, // overdue
    { isbn: '978-0553380163', borrower: 'student.shanto', status: LoanStatus.RETURNED, daysAgo: 20, dueInDays: -13, returnedDaysAgo: 12 },
    { isbn: '978-0262033848', borrower: 'student.tanvir', status: LoanStatus.BORROWED, daysAgo: 1, dueInDays: 13 },
    { isbn: '978-1426217968', borrower: 'student.sabbir', status: LoanStatus.OVERDUE, daysAgo: 15, dueInDays: -1 },
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
        create: { name: fs.name, amount, frequency: fs.frequency, gradeId: grades[level].id, institutionId },
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

  // --- Scholarships: a merit one and a need-based one, plus one on the test student for demo ---
  const scholarshipDefs = [
    { studentUsername: 'student.arif', name: 'Merit Scholarship', type: DiscountType.PERCENTAGE, value: 20, notes: 'Awarded for top exam performance.' },
    { studentUsername: 'student.nishat', name: 'Need-Based Scholarship', type: DiscountType.FIXED, value: 1000, notes: 'Financial hardship support.' },
    { studentUsername: 'student', name: 'Merit Scholarship', type: DiscountType.PERCENTAGE, value: 15, notes: 'Test account demo scholarship.' },
  ];
  for (const sc of scholarshipDefs) {
    const studentId = students[sc.studentUsername]?.id;
    if (!studentId) continue;
    const existing = await prisma.scholarship.findFirst({ where: { studentId, name: sc.name } });
    if (!existing) {
      await prisma.scholarship.create({
        data: { name: sc.name, type: sc.type, value: sc.value, notes: sc.notes, studentId },
      });
    }
  }

  console.log('✅ Seed complete.');
  console.log('   SuperAdmin: superadmin / superadmin  (no institution)');
  console.log('   Admin:      admin / admin');
  console.log('   Test Student: student / student   (Nayeem Hasan, class 1A)');
  console.log('   Test Parent:  parent / parent      (Kamrul Hasan, parent of the test student)');
  console.log('   Teachers:   teacher.rahim / .karim / .fatema / .jasim / .nasrin / .mizan / .shirin / .kamal / .ruma / .selim — password: teacher123');
  console.log('   Parents:    parent.hossain / .rahman / .islam / .akter / .chowdhury / .sarker / .molla / .talukder — password: parent123');
  console.log('   Students:   20 students across classes 1A-8A — password: student123 (+ 1 test student above)');
  console.log('   Accountant: accountant.nasima — password: accountant123');
  console.log('   Librarian:  librarian.jahid — password: librarian123');
  console.log('   Principal:  principal.rowshan — password: principal123');
  console.log('   Transport:  transport.jalal — password: transport123');
  console.log('   + 8 grades, 13 subjects, 11 classes, 4 departments/groups (2 classes assigned), 1 academic year + 3 terms,');
  console.log('     55 lessons, 100 attendance rows (present/absent/late/excused/leave mix), 11 exams, 11 assignments, 40 results,');
  console.log('     5 events, 4 announcements, 2 messages, 6 library books with 5 loans (active/returned/overdue),');
  console.log('     16 fee structures, 20 invoices spread across PENDING/PARTIAL/PAID/OVERDUE with matching payments, 3 scholarships,');
  console.log('     2 transport routes with 3 stops each + 2 vehicles, 50 teacher-attendance rows, 15 staff-attendance rows,');
  console.log('     5 leave applications (all statuses).');
}

// Neon can drop long-lived connections (P1017). The seed is idempotent,
// so on a transient DB error we reconnect and run it again.
async function runWithRetry(maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await main();
      return;
    } catch (e: any) {
      const transient = ['P1017', 'P1001', 'P1008', 'P2024'].includes(e?.code);
      if (!transient || attempt === maxAttempts) throw e;
      console.warn(`⚠️  DB connection dropped (${e.code}), retrying ${attempt}/${maxAttempts - 1}...`);
      await basePrisma.$disconnect();
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

runWithRetry()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await basePrisma.$disconnect();
  });

// Fresh setup:
//   npx prisma migrate reset --skip-seed
//   npm run prisma:seed
//   npm run start:devimport { PrismaClient, Role, Day, LoanStatus, FeeFrequency, PaymentStatus, PaymentMethod } from '@prisma/client';