-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TRANSPORT_STAFF';

-- CreateTable
CREATE TABLE "transport_staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "transport_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "route" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "transportStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transport_staff_userId_key" ON "transport_staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- AddForeignKey
ALTER TABLE "transport_staff" ADD CONSTRAINT "transport_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_transportStaffId_fkey" FOREIGN KEY ("transportStaffId") REFERENCES "transport_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
