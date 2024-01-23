-- CreateTable
CREATE TABLE "CommissionTier" (
    "commissionTierId" SERIAL NOT NULL,
    "tier" INTEGER NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CommissionTier_pkey" PRIMARY KEY ("commissionTierId")
);

-- CreateTable
CREATE TABLE "Commission" (
    "commissionId" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "convertedAmount" DOUBLE PRECISION,
    "desiredCurrency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("commissionId")
);

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE RESTRICT ON UPDATE CASCADE;
