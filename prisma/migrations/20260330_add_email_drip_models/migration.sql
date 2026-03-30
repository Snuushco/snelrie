-- CreateEnum
CREATE TYPE "DripSequenceType" AS ENUM ('FREE_SCAN_COMPLETED', 'ACCOUNT_CREATED', 'SUBSCRIPTION_ACTIVE');

-- CreateEnum
CREATE TYPE "DripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "EmailDrip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sequence" "DripSequenceType" NOT NULL,
    "status" "DripStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "EmailDrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDripStep" (
    "id" TEXT NOT NULL,
    "dripId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "messageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "EmailDripStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailDrip_status_idx" ON "EmailDrip"("status");
CREATE INDEX "EmailDrip_sequence_idx" ON "EmailDrip"("sequence");
CREATE INDEX "EmailDrip_email_idx" ON "EmailDrip"("email");
CREATE UNIQUE INDEX "EmailDrip_userId_sequence_key" ON "EmailDrip"("userId", "sequence");

-- CreateIndex
CREATE INDEX "EmailDripStep_scheduledAt_idx" ON "EmailDripStep"("scheduledAt");
CREATE INDEX "EmailDripStep_status_idx" ON "EmailDripStep"("status");
CREATE UNIQUE INDEX "EmailDripStep_dripId_step_key" ON "EmailDripStep"("dripId", "step");

-- AddForeignKey
ALTER TABLE "EmailDripStep" ADD CONSTRAINT "EmailDripStep_dripId_fkey" FOREIGN KEY ("dripId") REFERENCES "EmailDrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
