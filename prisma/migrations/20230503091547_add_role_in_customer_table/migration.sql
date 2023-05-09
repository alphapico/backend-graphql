-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerRole" "CustomerRole" NOT NULL DEFAULT 'USER';
