-- CreateEnum
CREATE TYPE "RiebuddyReferralStatus" AS ENUM ('REFERRED', 'CONTACTED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "RiebuddyReferral" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "branche" TEXT NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RiebuddyReferralStatus" NOT NULL DEFAULT 'REFERRED',
    "riebuddyResponse" TEXT,
    "firstYearRevenue" DECIMAL(10,2),
    "commissionAmount" DECIMAL(10,2),
    "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "RiebuddyReferral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiebuddyReferral_reportId_idx" ON "RiebuddyReferral"("reportId");

-- CreateIndex
CREATE INDEX "RiebuddyReferral_userId_idx" ON "RiebuddyReferral"("userId");

-- CreateIndex
CREATE INDEX "RiebuddyReferral_status_idx" ON "RiebuddyReferral"("status");

-- CreateIndex
CREATE INDEX "RiebuddyReferral_referredAt_idx" ON "RiebuddyReferral"("referredAt");

-- AddForeignKey
ALTER TABLE "RiebuddyReferral" ADD CONSTRAINT "RiebuddyReferral_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RieReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
