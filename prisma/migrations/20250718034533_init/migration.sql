/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserBiometrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `UserBiometrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBiometrics" ADD COLUMN     "username" VARCHAR(155) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserBiometrics_username_key" ON "UserBiometrics"("username");
