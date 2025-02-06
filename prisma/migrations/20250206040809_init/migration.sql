/*
  Warnings:

  - You are about to drop the column `drugId` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Drugs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_drugId_fkey";

-- DropIndex
DROP INDEX "Inventory_drugId_key";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "drugId";

-- CreateTable
CREATE TABLE "Group" (
    "id" VARCHAR(100) NOT NULL,
    "drugId" VARCHAR(100) NOT NULL,
    "inventoryId" VARCHAR(100) NOT NULL,
    "groupStatus" INTEGER NOT NULL,
    "comment" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupInventory" (
    "id" VARCHAR(100) NOT NULL,
    "groupId" VARCHAR(100) NOT NULL,
    "inventoryId" VARCHAR(100) NOT NULL,
    "min" INTEGER NOT NULL DEFAULT 0,
    "max" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GroupInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drugs_id_key" ON "Drugs"("id");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupInventory" ADD CONSTRAINT "GroupInventory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupInventory" ADD CONSTRAINT "GroupInventory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
