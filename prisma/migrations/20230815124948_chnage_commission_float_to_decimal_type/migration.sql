/*
  Warnings:

  - You are about to alter the column `commission` on the `CommissionTier` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,4)`.

*/
-- AlterTable
ALTER TABLE "CommissionTier" ALTER COLUMN "commission" SET DATA TYPE DECIMAL(4,4);
