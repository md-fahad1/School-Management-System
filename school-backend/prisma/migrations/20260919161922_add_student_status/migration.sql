-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED', 'DROPPED', 'EXPELLED', 'ALUMNI');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");
