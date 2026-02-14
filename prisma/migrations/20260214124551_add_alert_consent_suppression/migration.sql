-- AlterTable
ALTER TABLE "PropertyAlert" ADD COLUMN     "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "consentIp" TEXT,
ADD COLUMN     "consentSource" TEXT,
ADD COLUMN     "consentUserAgent" TEXT;

-- CreateTable
CREATE TABLE "SuppressionEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuppressionEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuppressionEmail_email_key" ON "SuppressionEmail"("email");
