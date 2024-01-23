/*
  Warnings:

  - A unique constraint covering the columns `[purchaseCode]` on the table `PurchaseActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PurchaseActivity_packageId_key";

-- DropIndex
DROP INDEX "PurchaseActivity_tokenPriceId_key";

-- AlterTable
ALTER TABLE "PurchaseActivity" ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "purchaseCode" TEXT NOT NULL DEFAULT 'DEFAULT_CODE';

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseActivity_purchaseCode_key" ON "PurchaseActivity"("purchaseCode");

-- AddForeignKey
ALTER TABLE "PurchaseActivity" ADD CONSTRAINT "PurchaseActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
