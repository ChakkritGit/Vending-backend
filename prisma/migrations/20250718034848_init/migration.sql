/*
  Warnings:

  - You are about to drop the column `userId` on the `UserBiometrics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserBiometrics" DROP CONSTRAINT "UserBiometrics_userId_fkey";

-- DropIndex
DROP INDEX "UserBiometrics_userId_idx";

-- AlterTable
ALTER TABLE "UserBiometrics" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "UserBiometrics_id_idx" ON "UserBiometrics"("id");

-- AddForeignKey
ALTER TABLE "UserBiometrics" ADD CONSTRAINT "UserBiometrics_id_fkey" FOREIGN KEY ("id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
