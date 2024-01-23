-- AlterTable
ALTER TABLE "Charge" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP NOT NULL;
