-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_referralCustomerId_fkey";

-- DropIndex
DROP INDEX "Customer_referralCustomerId_key";
