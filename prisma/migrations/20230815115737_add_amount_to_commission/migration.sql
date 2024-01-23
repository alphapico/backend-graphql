/*
  Warnings:

  - You are about to drop the column `tokenAmount` on the `Commission` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "tokenAmount",
ADD COLUMN     "amount" INTEGER NOT NULL;
