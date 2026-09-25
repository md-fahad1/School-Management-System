-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('THEORY', 'PRACTICAL', 'LAB');

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "code" TEXT,
ADD COLUMN     "credit" DOUBLE PRECISION,
ADD COLUMN     "isFourthSubject" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOptional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "SubjectType" NOT NULL DEFAULT 'THEORY';
