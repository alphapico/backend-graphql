/*
  Warnings:

  - Added the required column `currency` to the `PurchaseActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseActivity" ADD COLUMN     "currency" TEXT NOT NULL;
