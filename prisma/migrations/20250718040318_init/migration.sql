/*
  Warnings:

  - You are about to drop the column `username` on the `UserBiometrics` table. All the data in the column will be lost.
  - Added the required column `userId` to the `UserBiometrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserBiometrics" DROP CONSTRAINT "UserBiometrics_id_fkey";

-- DropIndex
DROP INDEX "UserBiometrics_id_idx";

-- DropIndex
DROP INDEX "UserBiometrics_username_key";

-- AlterTable
ALTER TABLE "UserBiometrics" DROP COLUMN "username",
ADD COLUMN     "userId" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE INDEX "UserBiometrics_userId_idx" ON "UserBiometrics"("userId");

-- AddForeignKey
ALTER TABLE "UserBiometrics" ADD CONSTRAINT "UserBiometrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
