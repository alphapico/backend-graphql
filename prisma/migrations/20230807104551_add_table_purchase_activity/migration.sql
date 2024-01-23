-- CreateTable
CREATE TABLE "PurchaseActivity" (
    "purchaseActivityId" SERIAL NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "packageId" INTEGER,
    "tokenPriceId" INTEGER,
    "tokenAmount" DOUBLE PRECISION,
    "purchaseConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseActivity_pkey" PRIMARY KEY ("purchaseActivityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseActivity_chargeId_key" ON "PurchaseActivity"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseActivity_packageId_key" ON "PurchaseActivity"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseActivity_tokenPriceId_key" ON "PurchaseActivity"("tokenPriceId");

-- AddForeignKey
ALTER TABLE "PurchaseActivity" ADD CONSTRAINT "PurchaseActivity_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseActivity" ADD CONSTRAINT "PurchaseActivity_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TokenPackage"("packageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseActivity" ADD CONSTRAINT "PurchaseActivity_tokenPriceId_fkey" FOREIGN KEY ("tokenPriceId") REFERENCES "TokenPrice"("tokenPriceId") ON DELETE SET NULL ON UPDATE CASCADE;
