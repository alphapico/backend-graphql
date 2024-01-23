/*
  Warnings:

  - Added the required column `amount` to the `PurchaseActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseActivity" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
