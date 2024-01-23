/*
  Warnings:

  - Changed the type of `level` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "level",
ADD COLUMN     "level" "LogStatus" NOT NULL;

-- DropEnum
DROP TYPE "LogLevel";
