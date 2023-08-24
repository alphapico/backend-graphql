/*
  Warnings:

  - You are about to drop the column `addresses` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeRates` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `localExchangeRates` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "addresses" JSONB;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "isTransferred" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "addresses",
DROP COLUMN "exchangeRates",
DROP COLUMN "localExchangeRates",
ADD COLUMN     "type" TEXT;
