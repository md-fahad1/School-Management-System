-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER');

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "relation" "GuardianRelation";
