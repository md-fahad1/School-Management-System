import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getTenant } from './tenant-context';

// Models that carry their own institutionId column.
const DIRECT_MODELS = new Set([
  'User', 'Grade', 'Class', 'Subject', 'Book',
  'FeeStructure', 'Vehicle', 'Event', 'Announcement', 'AuditLog',
  'AcademicYear', 'Department',
]);

// Models that belong to an institution through a relation path
// (e.g. Payment -> Invoice -> Student -> User -> institutionId).
type Filter = Record<string, unknown>;
const viaUser = (id: string): Filter => ({ user: { institutionId: id } });
const viaStudent = (id: string): Filter => ({ student: { user: { institutionId: id } } });
const viaLesson = (id: string): Filter => ({ lesson: { class: { institutionId: id } } });

const VIA_MODELS: Record<string, (id: string) => Filter> = {
  Admin: viaUser,
  Teacher: viaUser,
  Student: viaUser,
  Parent: viaUser,
  Accountant: viaUser,
  Librarian: viaUser,
  Principal: viaUser,
  TransportStaff: viaUser,
  StaffAttendance: viaUser,
  TeacherAttendance: (id) => ({ teacher: viaUser(id) }),
  Lesson: (id) => ({ class: { institutionId: id } }),
  Exam: viaLesson,
  Assignment: viaLesson,
  Result: viaStudent,
  Attendance: viaStudent,
  Invoice: viaStudent,
  Scholarship: viaStudent,
  Payment: (id) => ({ invoice: viaStudent(id) }),
  BookLoan: (id) => ({ book: { institutionId: id } }),
  Message: (id) => ({ sender: { institutionId: id } }),
  Leave: (id) => ({ applicant: { institutionId: id } }),
  UserPermission: viaUser,
  Term: (id) => ({ academicYear: { institutionId: id } }),
};

// Custom roles: institutionId = null means a built-in system role. Everyone
// can READ those, but only a role that belongs to your own institution can
// be changed or deleted.
const sharedRoleFilter = (id: string): Filter => ({
  OR: [{ institutionId: id }, { institutionId: null }],
});
const ownRoleFilter = (id: string): Filter => ({ institutionId: id });

const READ_OPS = new Set([
  'findFirst', 'findFirstOrThrow', 'findMany', 'findUnique', 'findUniqueOrThrow',
  'count', 'aggregate', 'groupBy',
]);

const FILTERED_OPS = new Set([
  ...READ_OPS,
  'update', 'updateMany', 'delete', 'deleteMany', 'upsert',
]);

const WRITE_CHECK_OPS = new Set(['create', 'createMany', 'update', 'updateMany', 'upsert']);

// ---------------------------------------------------------------------------
// Cross-tenant reference guard.
// Filtering `where` is not enough: `create({ data: { classId: <other school's
// class> } })` has no where clause to filter. So every id a client can send
// for a foreign key is checked to belong to the caller's institution.
// "Model:own" = the referenced row must belong to the caller (not a shared one).
// ---------------------------------------------------------------------------
const FK_REFS: Record<string, Record<string, string>> = {
  User: { customRoleId: 'CustomRole' },
  UserPermission: { userId: 'User' },
  CustomRolePermission: { customRoleId: 'CustomRole:own' },
  Class: { gradeId: 'Grade', supervisorId: 'Teacher', departmentId: 'Department' },
  Student: { classId: 'Class', gradeId: 'Grade', parentId: 'Parent' },
  Lesson: { classId: 'Class', subjectId: 'Subject', teacherId: 'Teacher' },
  Exam: { lessonId: 'Lesson' },
  Assignment: { lessonId: 'Lesson' },
  Result: { studentId: 'Student', examId: 'Exam', assignmentId: 'Assignment' },
  Attendance: { studentId: 'Student', lessonId: 'Lesson' },
  TeacherAttendance: { teacherId: 'Teacher' },
  StaffAttendance: { userId: 'User' },
  Leave: { applicantId: 'User', approvedById: 'User' },
  Event: { classId: 'Class' },
  Announcement: { classId: 'Class', authorId: 'User' },
  Message: { senderId: 'User', receiverId: 'User' },
  BookLoan: { bookId: 'Book', borrowerId: 'User', issuedById: 'User' },
  FeeStructure: { gradeId: 'Grade' },
  Invoice: { studentId: 'Student', feeStructureId: 'FeeStructure' },
  Payment: { invoiceId: 'Invoice', receivedById: 'User' },
  Scholarship: { studentId: 'Student' },
  Vehicle: { transportStaffId: 'TransportStaff' },
  Term: { academicYearId: 'AcademicYear' },
};

// many-to-many relations written with connect / set
const CONNECT_REFS: Record<string, Record<string, string>> = {
  Subject: { teachers: 'Teacher' },
  Teacher: { subjects: 'Subject' },
};

// profile rows created inside User.create({ data: { student: { create } } })
const NESTED_CREATE: Record<string, Record<string, string>> = {
  User: { student: 'Student', teacher: 'Teacher', parent: 'Parent', transportStaff: 'TransportStaff' },
};

type Ref = { field: string; spec: string; ids: string[] };

function idsFrom(v: any): string[] {
  if (typeof v === 'string') return [v];
  if (v && typeof v === 'object') {
    if (typeof v.set === 'string') return [v.set];
    const list = v.connect ?? v.set;
    const arr = Array.isArray(list) ? list : list ? [list] : [];
    return arr.map((x: any) => x?.id).filter((x: any) => typeof x === 'string');
  }
  return [];
}

function collectRefs(model: string, data: any, out: Ref[]) {
  if (!data || typeof data !== 'object') return;
  if (Array.isArray(data)) {
    for (const d of data) collectRefs(model, d, out);
    return;
  }
  for (const [field, spec] of Object.entries(FK_REFS[model] ?? {})) {
    const ids = idsFrom(data[field]);
    if (ids.length) out.push({ field, spec, ids });
  }
  for (const [rel, spec] of Object.entries(CONNECT_REFS[model] ?? {})) {
    const ids = idsFrom(data[rel]);
    if (ids.length) out.push({ field: rel, spec, ids });
  }
  for (const [rel, child] of Object.entries(NESTED_CREATE[model] ?? {})) {
    const c = data[rel]?.create;
    if (c) collectRefs(child, c, out);
  }
}

function scopeFilter(model: string, id: string, ownOnly = false): Filter | undefined {
  if (model === 'CustomRole') return ownOnly ? ownRoleFilter(id) : sharedRoleFilter(id);
  if (DIRECT_MODELS.has(model)) return { institutionId: id };
  const via = VIA_MODELS[model];
  return via ? via(id) : undefined;
}

async function assertOwned(client: any, ref: Ref, tenantId: string) {
  const [refModel, mode] = ref.spec.split(':');
  const filter = scopeFilter(refModel, tenantId, mode === 'own');
  const delegate = client[refModel.charAt(0).toLowerCase() + refModel.slice(1)];
  const unique = [...new Set(ref.ids)];
  const found = await delegate.count({
    where: { id: { in: unique }, ...(filter ? { AND: [filter] } : {}) },
  });
  if (found !== unique.length) {
    throw new BadRequestException(`Invalid ${ref.field}: record not found in your institution`);
  }
}

async function assertReferences(client: any, model: string, operation: string, a: any, tenantId: string) {
  const refs: Ref[] = [];
  if (operation === 'upsert') {
    collectRefs(model, a.create, refs);
    collectRefs(model, a.update, refs);
  } else {
    collectRefs(model, a.data, refs);
  }
  for (const ref of refs) await assertOwned(client, ref, tenantId);
}

// Adds `filter` to a where clause without breaking findUnique/update/delete,
// which need their unique key to stay at the top level of `where`.
function withFilter(where: any, filter: Filter) {
  const existingAnd = where?.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
  return { ...(where ?? {}), AND: [...existingAnd, filter] };
}

export function tenantExtension() {
  // Function form: `client` is the un-extended client, which the reference
  // guard uses for its own count() queries (it adds the tenant filter itself).
  return Prisma.defineExtension((client: any) =>
    client.$extends({
      name: 'tenant-scope',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const tenant = getTenant();
            const isDirect = DIRECT_MODELS.has(model);
            const isRole = model === 'CustomRole';
            const isRolePerm = model === 'CustomRolePermission';
            const via = VIA_MODELS[model] as ((id: string) => Filter) | undefined;

            // Anonymous requests (login, register, password reset...) may only
            // touch User plus the tables that are not tenant-owned. Reading or
            // changing any other tenant table without a login is refused.
            if (
              tenant?.anonymous &&
              model !== 'User' &&
              (isDirect || isRole || isRolePerm || via) &&
              operation !== 'create' &&
              operation !== 'createMany'
            ) {
              throw new ForbiddenException('Authentication required');
            }

            // Platform owner, seed scripts and other system code: no scoping.
            if (!tenant || tenant.isSuperAdmin || !tenant.institutionId) {
              return runQuery(model, query, args);
            }

            const id = tenant.institutionId;
            const a: any = { ...(args ?? {}) };
            const isRead = READ_OPS.has(operation);

            if (FILTERED_OPS.has(operation)) {
              if (isRole) {
                a.where = withFilter(a.where, isRead ? sharedRoleFilter(id) : ownRoleFilter(id));
              } else if (isRolePerm) {
                a.where = withFilter(a.where, {
                  customRole: isRead ? sharedRoleFilter(id) : ownRoleFilter(id),
                });
              } else if (isDirect) {
                a.where = withFilter(a.where, { institutionId: id });
              } else if (via) {
                a.where = withFilter(a.where, via(id));
              }
            }

            if (isDirect || isRole) {
              if (operation === 'create') {
                a.data = { ...a.data, institutionId: id };
              } else if (operation === 'createMany') {
                const rows = Array.isArray(a.data) ? a.data : [a.data];
                a.data = rows.map((r: any) => ({ ...r, institutionId: id }));
              } else if (operation === 'upsert') {
                a.create = { ...a.create, institutionId: id };
              }
            }

            if (WRITE_CHECK_OPS.has(operation)) {
              await assertReferences(client, model, operation, a, id);
            }

            return runQuery(model, query, a);
          },
        },
      },
    }),
  );
}

async function runQuery(model: string, query: (a: any) => Promise<any>, args: any) {
  try {
    return await query(args);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        if (model === 'User') {
          throw new BadRequestException('Username, email, or phone already in use');
        }
        const target = (e.meta as any)?.target;
        const fields = (Array.isArray(target) ? target : target ? [target] : []).filter(
          (f: string) => f !== 'institutionId',
        );
        throw new BadRequestException(
          fields.length ? `Already exists (same ${fields.join(', ')})` : 'This record already exists',
        );
      }
      if (e.code === 'P2003') {
        throw new BadRequestException(
          'This record is linked to other data, so it cannot be changed or deleted',
        );
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('Record not found');
      }
    }
    throw e;
  }
}