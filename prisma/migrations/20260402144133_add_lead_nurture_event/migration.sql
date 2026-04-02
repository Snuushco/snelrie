-- CreateEnum
CREATE TYPE "NurtureEventType" AS ENUM ('SIGNUP', 'DEMO_REQUEST', 'PRICING_ABANDON', 'TRIAL_EXPIRY');

-- CreateTable
CREATE TABLE "LeadNurtureEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventType" "NurtureEventType" NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextEmailDue" TIMESTAMP(3),
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "lastEmailAt" TIMESTAMP(3),
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "abVariant" TEXT,
    "metadata" JSONB,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "LeadNurtureEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadNurtureEvent_userId_idx" ON "LeadNurtureEvent"("userId");

-- CreateIndex
CREATE INDEX "LeadNurtureEvent_eventType_idx" ON "LeadNurtureEvent"("eventType");

-- CreateIndex
CREATE INDEX "LeadNurtureEvent_suppressed_idx" ON "LeadNurtureEvent"("suppressed");

-- CreateIndex
CREATE INDEX "LeadNurtureEvent_nextEmailDue_idx" ON "LeadNurtureEvent"("nextEmailDue");

-- CreateIndex
CREATE INDEX "LeadNurtureEvent_email_idx" ON "LeadNurtureEvent"("email");

-- AddForeignKey
ALTER TABLE "LeadNurtureEvent" ADD CONSTRAINT "LeadNurtureEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
