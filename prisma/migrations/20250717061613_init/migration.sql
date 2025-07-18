-- CreateTable
CREATE TABLE "UserBiometrics" (
    "id" VARCHAR(100) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FINGER_VEIN',
    "featureData" BYTEA NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR(100) NOT NULL,

    CONSTRAINT "UserBiometrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBiometrics_id_key" ON "UserBiometrics"("id");

-- CreateIndex
CREATE INDEX "UserBiometrics_userId_idx" ON "UserBiometrics"("userId");

-- AddForeignKey
ALTER TABLE "UserBiometrics" ADD CONSTRAINT "UserBiometrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
