/*
  Warnings:

  - You are about to drop the column `referenceId` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[packageId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "FK_CustomerImages";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "FK_PackageImages";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "referenceId",
ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "packageId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Image_customerId_key" ON "Image"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_packageId_key" ON "Image"("packageId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TokenPackage"("packageId") ON DELETE SET NULL ON UPDATE CASCADE;
