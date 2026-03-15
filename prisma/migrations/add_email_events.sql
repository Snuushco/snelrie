-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "messageId" TEXT,
    "link" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailEvent_email_idx" ON "EmailEvent"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailEvent_type_idx" ON "EmailEvent"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailEvent_messageId_idx" ON "EmailEvent"("messageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailEvent_createdAt_idx" ON "EmailEvent"("createdAt");
