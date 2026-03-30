-- AlterTable
ALTER TABLE "RieReport" ADD COLUMN "signatures" JSONB;

-- CreateTable
CREATE TABLE "SignLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignLink_token_key" ON "SignLink"("token");

-- CreateIndex
CREATE INDEX "SignLink_token_idx" ON "SignLink"("token");

-- CreateIndex
CREATE INDEX "SignLink_reportId_idx" ON "SignLink"("reportId");

-- AddForeignKey
ALTER TABLE "SignLink" ADD CONSTRAINT "SignLink_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RieReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
