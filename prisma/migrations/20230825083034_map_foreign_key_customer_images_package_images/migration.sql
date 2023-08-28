/*
  Warnings:

  - Made the column `referenceId` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "referenceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "FK_CustomerImages" FOREIGN KEY ("referenceId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "FK_PackageImages" FOREIGN KEY ("referenceId") REFERENCES "TokenPackage"("packageId") ON DELETE RESTRICT ON UPDATE CASCADE;
