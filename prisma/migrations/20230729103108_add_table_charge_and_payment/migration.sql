-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NEW', 'PENDING', 'COMPLETED', 'UNRESOLVED', 'RESOLVED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UnresolvedReason" AS ENUM ('UNDERPAID', 'OVERPAID', 'DELAYED', 'MULTIPLE', 'OTHER');

-- CreateTable
CREATE TABLE "Charge" (
    "chargeId" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricingType" TEXT NOT NULL,
    "pricing" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("chargeId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" SERIAL NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "network" TEXT NOT NULL,
    "transaction" TEXT NOT NULL,
    "addresses" JSONB NOT NULL,
    "value" JSONB NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "unresolvedReason" "UnresolvedReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charge_code_key" ON "Charge"("code");

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("chargeId") ON DELETE RESTRICT ON UPDATE CASCADE;
