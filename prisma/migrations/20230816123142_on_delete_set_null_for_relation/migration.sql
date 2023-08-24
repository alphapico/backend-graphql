-- DropForeignKey
ALTER TABLE "Charge" DROP CONSTRAINT "Charge_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_chargeId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_chargeId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseActivity" DROP CONSTRAINT "PurchaseActivity_chargeId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_customerId_fkey";

-- AlterTable
ALTER TABLE "Charge" ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Commission" ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "chargeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "chargeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseActivity" ALTER COLUMN "chargeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseActivity" ADD CONSTRAINT "PurchaseActivity_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE SET NULL ON UPDATE CASCADE;
