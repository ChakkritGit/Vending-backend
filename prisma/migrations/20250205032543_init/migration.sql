/*
  Warnings:

  - Changed the type of `drugLot` on the `Drugs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Drugs" DROP COLUMN "drugLot",
ADD COLUMN     "drugLot" TIMESTAMP(3) NOT NULL;
