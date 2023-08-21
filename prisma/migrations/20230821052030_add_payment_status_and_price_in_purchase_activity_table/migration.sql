/*
  Warnings:

  - Added the required column `paymentStatus` to the `PurchaseActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PurchaseActivity` table without a default value. This is not possible if the table is not empty.
  - Made the column `tokenAmount` on table `PurchaseActivity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PurchaseActivity" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ALTER COLUMN "tokenAmount" SET NOT NULL;
