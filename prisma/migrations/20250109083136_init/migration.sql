/*
  Warnings:

  - The primary key for the `Drugs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_drugId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_drugId_fkey";

-- AlterTable
ALTER TABLE "Drugs" DROP CONSTRAINT "Drugs_pkey",
ADD CONSTRAINT "Drugs_pkey" PRIMARY KEY ("drugCode");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drugs"("drugCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drugs"("drugCode") ON DELETE RESTRICT ON UPDATE CASCADE;
