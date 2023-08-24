-- CreateTable
CREATE TABLE "TokenPrice" (
    "tokenPriceId" SERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("tokenPriceId")
);

-- CreateTable
CREATE TABLE "TokenPackage" (
    "packageId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tokenAmount" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TokenPackage_pkey" PRIMARY KEY ("packageId")
);
