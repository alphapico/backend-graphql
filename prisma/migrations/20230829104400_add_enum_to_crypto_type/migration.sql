/*
  Warnings:

  - The `cryptoType` column on the `Wallet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CryptoType" AS ENUM ('DAI', 'USDC', 'PUSDC', 'PWETH', 'USDT', 'APE', 'BTC', 'PMATIC', 'DOGE', 'ETH', 'LTC', 'SHIB', 'BCH');

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "cryptoType",
ADD COLUMN     "cryptoType" "CryptoType" NOT NULL DEFAULT 'ETH';
