-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'MANUALLY_ACCEPTED';
ALTER TYPE "PaymentStatus" ADD VALUE 'MANUALLY_UNACCEPTED';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "network" DROP NOT NULL,
ALTER COLUMN "transaction" DROP NOT NULL,
ALTER COLUMN "value" DROP NOT NULL;
