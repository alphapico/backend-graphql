/*
  Warnings:

  - The values [VERIFICATION_SENT,VERIFICATION_FAILED] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('UNVERIFIED', 'VERIFIED');
ALTER TABLE "Customer" ALTER COLUMN "emailStatus" DROP DEFAULT;
ALTER TABLE "Customer" ALTER COLUMN "emailStatus" TYPE "EmailStatus_new" USING ("emailStatus"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "EmailStatus_old";
ALTER TABLE "Customer" ALTER COLUMN "emailStatus" SET DEFAULT 'UNVERIFIED';
COMMIT;

-- CreateTable
CREATE TABLE "Log" (
    "logId" SERIAL NOT NULL,
    "level" "LogLevel" NOT NULL,
    "code" TEXT,
    "statusCode" INTEGER,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "serviceName" TEXT,
    "methodName" TEXT,
    "requestID" INTEGER,
    "userId" INTEGER,
    "userEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("logId")
);
