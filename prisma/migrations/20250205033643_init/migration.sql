/*
  Warnings:

  - Added the required column `drugExpire` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drugLot` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "drugExpire" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "drugLot" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "drugPriority" INTEGER NOT NULL DEFAULT 1;
