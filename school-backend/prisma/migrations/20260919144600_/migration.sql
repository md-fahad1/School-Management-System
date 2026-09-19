/*
  Warnings:

  - A unique constraint covering the columns `[institutionId,isbn]` on the table `books` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institutionId,name]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institutionId,level]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institutionId,name]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institutionId,vehicleNumber]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `institutionId` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `fee_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'COLLEGE', 'SCHOOL_AND_COLLEGE', 'MADRASA', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('SCHOOL', 'COLLEGE');

-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('GROUP', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('TERM', 'SEMESTER', 'TRIMESTER');

-- AlterEnum
ALTER TYPE "Day" ADD VALUE 'SUNDAY';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- DropIndex
DROP INDEX "books_isbn_key";

-- DropIndex
DROP INDEX "classes_name_key";

-- DropIndex
DROP INDEX "grades_level_key";

-- DropIndex
DROP INDEX "subjects_name_key";

-- DropIndex
DROP INDEX "vehicles_vehicleNumber_key";

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "institutionId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "stage" "EducationLevel" NOT NULL DEFAULT 'SCHOOL';

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL DEFAULT 'SCHOOL',
    "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
    "eiin" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "establishedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" "DepartmentType" NOT NULL DEFAULT 'DEPARTMENT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TermType" NOT NULL DEFAULT 'TERM',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "academicYearId" TEXT NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_slug_key" ON "institutions"("slug");

-- CreateIndex
CREATE INDEX "departments_institutionId_idx" ON "departments"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_institutionId_name_key" ON "departments"("institutionId", "name");

-- CreateIndex
CREATE INDEX "academic_years_institutionId_idx" ON "academic_years"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_institutionId_name_key" ON "academic_years"("institutionId", "name");

-- CreateIndex
CREATE INDEX "terms_academicYearId_idx" ON "terms"("academicYearId");

-- CreateIndex
CREATE INDEX "announcements_institutionId_idx" ON "announcements"("institutionId");

-- CreateIndex
CREATE INDEX "announcements_classId_idx" ON "announcements"("classId");

-- CreateIndex
CREATE INDEX "announcements_authorId_idx" ON "announcements"("authorId");

-- CreateIndex
CREATE INDEX "assignments_lessonId_idx" ON "assignments"("lessonId");

-- CreateIndex
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");

-- CreateIndex
CREATE INDEX "attendances_lessonId_idx" ON "attendances"("lessonId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "audit_logs_institutionId_idx" ON "audit_logs"("institutionId");

-- CreateIndex
CREATE INDEX "book_loans_bookId_idx" ON "book_loans"("bookId");

-- CreateIndex
CREATE INDEX "book_loans_borrowerId_idx" ON "book_loans"("borrowerId");

-- CreateIndex
CREATE INDEX "book_loans_status_idx" ON "book_loans"("status");

-- CreateIndex
CREATE INDEX "books_institutionId_idx" ON "books"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "books_institutionId_isbn_key" ON "books"("institutionId", "isbn");

-- CreateIndex
CREATE INDEX "classes_institutionId_idx" ON "classes"("institutionId");

-- CreateIndex
CREATE INDEX "classes_gradeId_idx" ON "classes"("gradeId");

-- CreateIndex
CREATE INDEX "classes_supervisorId_idx" ON "classes"("supervisorId");

-- CreateIndex
CREATE INDEX "classes_departmentId_idx" ON "classes"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_institutionId_name_key" ON "classes"("institutionId", "name");

-- CreateIndex
CREATE INDEX "events_institutionId_idx" ON "events"("institutionId");

-- CreateIndex
CREATE INDEX "events_classId_idx" ON "events"("classId");

-- CreateIndex
CREATE INDEX "exams_lessonId_idx" ON "exams"("lessonId");

-- CreateIndex
CREATE INDEX "fee_structures_institutionId_idx" ON "fee_structures"("institutionId");

-- CreateIndex
CREATE INDEX "fee_structures_gradeId_idx" ON "fee_structures"("gradeId");

-- CreateIndex
CREATE INDEX "grades_institutionId_idx" ON "grades"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_institutionId_level_key" ON "grades"("institutionId", "level");

-- CreateIndex
CREATE INDEX "invoices_feeStructureId_idx" ON "invoices"("feeStructureId");

-- CreateIndex
CREATE INDEX "leaves_applicantId_idx" ON "leaves"("applicantId");

-- CreateIndex
CREATE INDEX "leaves_status_idx" ON "leaves"("status");

-- CreateIndex
CREATE INDEX "lessons_subjectId_idx" ON "lessons"("subjectId");

-- CreateIndex
CREATE INDEX "lessons_classId_idx" ON "lessons"("classId");

-- CreateIndex
CREATE INDEX "lessons_teacherId_idx" ON "lessons"("teacherId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_read_idx" ON "messages"("receiverId", "read");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_receivedById_idx" ON "payments"("receivedById");

-- CreateIndex
CREATE INDEX "results_studentId_idx" ON "results"("studentId");

-- CreateIndex
CREATE INDEX "results_examId_idx" ON "results"("examId");

-- CreateIndex
CREATE INDEX "results_assignmentId_idx" ON "results"("assignmentId");

-- CreateIndex
CREATE INDEX "students_parentId_idx" ON "students"("parentId");

-- CreateIndex
CREATE INDEX "students_classId_idx" ON "students"("classId");

-- CreateIndex
CREATE INDEX "students_gradeId_idx" ON "students"("gradeId");

-- CreateIndex
CREATE INDEX "subjects_institutionId_idx" ON "subjects"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_institutionId_name_key" ON "subjects"("institutionId", "name");

-- CreateIndex
CREATE INDEX "users_institutionId_idx" ON "users"("institutionId");

-- CreateIndex
CREATE INDEX "vehicles_institutionId_idx" ON "vehicles"("institutionId");

-- CreateIndex
CREATE INDEX "vehicles_transportStaffId_idx" ON "vehicles"("transportStaffId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_institutionId_vehicleNumber_key" ON "vehicles"("institutionId", "vehicleNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
