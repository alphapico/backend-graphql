/*
  Warnings:

  - You are about to drop the column `requestID` on the `Log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "requestID",
ADD COLUMN     "requestId" INTEGER;
