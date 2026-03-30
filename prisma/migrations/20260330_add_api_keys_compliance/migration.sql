-- AlterTable: Add pvaStatuses to RieReport
ALTER TABLE "RieReport" ADD COLUMN "pvaStatuses" JSONB;

-- CreateTable: ApiKey
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ComplianceCheck
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

CREATE UNIQUE INDEX "ComplianceCheck_reportId_item_key" ON "ComplianceCheck"("reportId", "item");
CREATE INDEX "ComplianceCheck_reportId_idx" ON "ComplianceCheck"("reportId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RieReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
