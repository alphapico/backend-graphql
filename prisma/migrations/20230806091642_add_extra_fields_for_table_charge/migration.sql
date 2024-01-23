/*
  Warnings:

  - Added the required column `cancelUrl` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRates` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeRate` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostedUrl` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localExchangeRates` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentThreshold` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redirectUrl` to the `Charge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "cancelUrl" TEXT NOT NULL,
ADD COLUMN     "exchangeRates" JSONB NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "feeRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hostedUrl" TEXT NOT NULL,
ADD COLUMN     "localExchangeRates" JSONB NOT NULL,
ADD COLUMN     "paymentThreshold" JSONB NOT NULL,
ADD COLUMN     "redirectUrl" TEXT NOT NULL;
