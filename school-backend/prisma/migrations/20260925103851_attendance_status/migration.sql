/*
  Warnings:

  - You are about to drop the column `present` on the `attendances` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEAVE');

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "present",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';
