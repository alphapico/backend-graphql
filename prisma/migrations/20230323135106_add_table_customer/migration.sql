-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "customerStatus" "CustomerStatus" NOT NULL DEFAULT 'PENDING',
    "referralCode" TEXT,
    "referralCustomerId" INTEGER,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralCustomerId_key" ON "Customer"("referralCustomerId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_referralCustomerId_fkey" FOREIGN KEY ("referralCustomerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
