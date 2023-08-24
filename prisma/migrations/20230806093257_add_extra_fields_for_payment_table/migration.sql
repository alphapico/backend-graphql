-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "exchangeRates" JSONB,
ADD COLUMN     "localExchangeRates" JSONB;
