# School Management System — Backend

NestJS + Prisma + PostgreSQL + GraphQL (code-first, Apollo).

## Stack
- **NestJS 10** — module structure, DI, guards
- **Prisma 5** — ORM, migrations, type-safe queries
- **PostgreSQL** — database
- **GraphQL** (`@nestjs/graphql` + Apollo) — single `/graphql` endpoint
- **JWT (passport-jwt)** — auth, role-based access control

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your real `DATABASE_URL` and `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```

3. Run Postgres locally (or via Docker):
   ```bash
   docker run --name school-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=school_db -p 5432:5432 -d postgres:16
   ```

4. Generate the Prisma client and run the first migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Seed an admin user + base data:
   ```bash
   npm run prisma:seed
   ```
   Logs in as `admin` / `admin123`.

6. Start the dev server:
   ```bash
   npm run start:dev
   ```
   GraphQL Playground: http://localhost:4000/graphql

## Auth flow

- `mutation login(input: { username, password })` → returns `accessToken`
- Send it as `Authorization: Bearer <token>` on subsequent requests
- `@Roles(Role.ADMIN)` on any resolver restricts it; `GqlJwtAuthGuard` + `RolesGuard` are already applied at the resolver level in each module

### Example queries/mutations to try in GraphQL Playground

```graphql
mutation Login {
  login(input: { username: "admin", password: "admin123" }) {
    accessToken
    role
  }
}

query AllExams {
  exams(take: 10) {
    id
    title
    startTime
    subjectName
    className
    teacherName
  }
}

mutation MarkClassAttendance {
  bulkMarkAttendance(
    input: {
      lessonId: "your-lesson-id"
      date: "2026-08-13"
      entries: [
        { studentId: "student-1-id", present: true }
        { studentId: "student-2-id", present: false }
      ]
    }
  ) {
    id
    present
  }
}
```
(Set the `Authorization: Bearer <accessToken>` header in Playground's HTTP Headers panel after logging in.)

## Data model

See `prisma/schema.prisma`. Every person (Admin/Teacher/Student/Parent) has a
`User` row for auth plus a role-specific profile table, linked 1:1.
Student creation requires an existing `Class`, `Grade`, and `Parent` — create
those first (or via the seed script) before creating students.

## Modules (all implemented)

Every module follows the same shape:
```
src/<domain>/
  entities/<domain>.entity.ts   — @ObjectType GraphQL shape
  dto/<domain>.dto.ts           — @InputType create/update DTOs
  <domain>.service.ts           — Prisma queries
  <domain>.resolver.ts          — @Query/@Mutation, guards, @Roles
  <domain>.module.ts            — wires service + resolver
```

| Module | Notes |
|---|---|
| `auth` | JWT login/register |
| `subjects` | Simple CRUD, many-to-many with teachers |
| `teachers` | Creates `User` + profile together |
| `students` | Relational create (class/grade/parent) + class capacity check |
| `parents` | Blocks delete if students are still linked |
| `grades` | Simple lookup, unique level |
| `classes` | Tied to grade + optional supervisor teacher |
| `lessons` | Role-based row visibility (teacher/class scoped) |
| `exams` | Role-based visibility + `@ResolveField` for joined subject/class/teacher names |
| `assignments` | Same pattern as exams |
| `results` | Enforces exactly one of `examId`/`assignmentId`; scoped per student/parent |
| `attendance` | Includes `bulkMarkAttendance` to mark a whole class in one transaction |
| `events` | School-wide (`classId: null`) events visible to all; class events scoped |
| `announcements` | Same visibility pattern as events, author auto-attached |
| `messages` | Direct user-to-user messaging: `inbox`, `conversation`, `sendMessage`, `markMessageRead` |

All list/detail queries and mutations are behind `GqlJwtAuthGuard`; mutations
that should be restricted further use `@Roles(Role.ADMIN, ...)`.

## Frontend integration notes (Next.js + Redux)

- Point Apollo Client or `graphql-request` at `http://localhost:4000/graphql`
- Store the JWT in an httpOnly cookie (set it from a Next.js API route/server action after calling `login`) rather than localStorage, to avoid XSS token theft
- If using Redux Toolkit: RTK Query's `graphqlRequestBaseQuery` (from `@rtk-query/graphql-request-base-query`) lets you define endpoints per query/mutation and get the same caching/invalidation behavior you'd get from a REST API slice
- Alternatively, use Apollo Client for data fetching/caching and keep Redux only for pure UI state (sidebar open/closed, filters, modals) — a common split in larger dashboards like this one
