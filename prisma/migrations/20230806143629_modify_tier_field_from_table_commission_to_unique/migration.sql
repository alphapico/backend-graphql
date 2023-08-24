/*
  Warnings:

  - A unique constraint covering the columns `[tier]` on the table `CommissionTier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommissionTier_tier_key" ON "CommissionTier"("tier");
