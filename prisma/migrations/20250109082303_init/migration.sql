-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Users" (
    "id" VARCHAR(100) NOT NULL,
    "username" VARCHAR(155) NOT NULL,
    "password" VARCHAR(155) NOT NULL,
    "display" VARCHAR(150) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "picture" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drugs" (
    "id" VARCHAR(100) NOT NULL,
    "drugCode" VARCHAR(100) NOT NULL,
    "drugName" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(155) NOT NULL,
    "weight" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "picture" VARCHAR(255),
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "drugId" VARCHAR(100) NOT NULL,
    "machineId" VARCHAR(100) NOT NULL,
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" VARCHAR(100) NOT NULL,
    "machineName" VARCHAR(200) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" VARCHAR(100) NOT NULL,
    "prescriptionId" VARCHAR(100) NOT NULL,
    "drugId" VARCHAR(100) NOT NULL,
    "drugName" VARCHAR(150) NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit" VARCHAR(150) NOT NULL,
    "position" VARCHAR(20) NOT NULL,
    "machineId" VARCHAR(100),
    "status" VARCHAR(100) NOT NULL,
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescriptions" (
    "id" VARCHAR(100) NOT NULL,
    "hn" VARCHAR(20) NOT NULL,
    "patientName" VARCHAR(200) NOT NULL,
    "wardCode" VARCHAR(20),
    "wardDesc" VARCHAR(200),
    "priorityCode" VARCHAR(20),
    "priorityDesc" VARCHAR(200),
    "status" VARCHAR(100) NOT NULL,
    "comment" VARCHAR(155),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_drugId_key" ON "Inventory"("drugId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
