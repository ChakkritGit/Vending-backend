/*
  Warnings:

  - Added the required column `drugExpire` to the `Drugs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drugLot` to the `Drugs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drugs" ADD COLUMN     "drugExpire" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "drugLot" VARCHAR(200) NOT NULL,
ADD COLUMN     "drugPriority" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "weight" SET DEFAULT 0;
