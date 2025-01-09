/*
  Warnings:

  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Prescriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_prescriptionId_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "prescriptionId" SET DATA TYPE VARCHAR(200),
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(200),
ADD CONSTRAINT "Prescriptions_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
