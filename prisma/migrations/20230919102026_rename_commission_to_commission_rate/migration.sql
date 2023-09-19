/*
  Warnings:

  - You are about to drop the column `commission` on the `CommissionTier` table. All the data in the column will be lost.
  - Added the required column `commissionRate` to the `CommissionTier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommissionTier" DROP COLUMN "commission",
ADD COLUMN     "commissionRate" DECIMAL(4,4) NOT NULL;
