/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "Role" ADD VALUE 'LIBRARIAN';
ALTER TYPE "Role" ADD VALUE 'PRINCIPAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "accountants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "accountants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "librarians" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "librarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "principals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "principals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountants_userId_key" ON "accountants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "librarians_userId_key" ON "librarians"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "principals_userId_key" ON "principals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "accountants" ADD CONSTRAINT "accountants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "librarians" ADD CONSTRAINT "librarians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principals" ADD CONSTRAINT "principals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
