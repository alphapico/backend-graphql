/*
  Warnings:

  - You are about to drop the column `configDesc` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Config" DROP COLUMN "configDesc",
DROP COLUMN "value",
ADD COLUMN     "referralViewLevel" INTEGER NOT NULL DEFAULT 3;
