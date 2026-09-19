/*
  Warnings:

  - A unique constraint covering the columns `[institutionId,name]` on the table `custom_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "custom_roles_name_key";

-- AlterTable
ALTER TABLE "custom_roles" ADD COLUMN     "institutionId" TEXT;

-- CreateIndex
CREATE INDEX "custom_roles_institutionId_idx" ON "custom_roles"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_institutionId_name_key" ON "custom_roles"("institutionId", "name");

-- AddForeignKey
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
