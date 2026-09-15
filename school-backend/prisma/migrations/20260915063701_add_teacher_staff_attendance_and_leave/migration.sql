-- CreateEnum
CREATE TYPE "HrAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "teacher_attendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "HrAttendanceStatus" NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "teacher_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_attendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "HrAttendanceStatus" NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "staff_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "applicantId" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_attendances_teacherId_date_key" ON "teacher_attendances"("teacherId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendances_userId_date_key" ON "staff_attendances"("userId", "date");

-- AddForeignKey
ALTER TABLE "teacher_attendances" ADD CONSTRAINT "teacher_attendances_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendances" ADD CONSTRAINT "staff_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
