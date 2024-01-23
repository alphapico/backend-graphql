/*
  Warnings:

  - You are about to drop the column `amount` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `convertedAmount` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `desiredCurrency` on the `Commission` table. All the data in the column will be lost.
  - Added the required column `tokenAmount` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "amount",
DROP COLUMN "convertedAmount",
DROP COLUMN "currency",
DROP COLUMN "desiredCurrency",
ADD COLUMN     "tokenAmount" DOUBLE PRECISION NOT NULL;
