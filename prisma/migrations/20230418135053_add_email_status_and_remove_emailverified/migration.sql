/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `Customer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNVERIFIED', 'VERIFICATION_SENT', 'VERIFICATION_FAILED', 'VERIFIED');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "emailVerified",
ADD COLUMN     "emailStatus" "EmailStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_referralCustomerId_fkey" FOREIGN KEY ("referralCustomerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
