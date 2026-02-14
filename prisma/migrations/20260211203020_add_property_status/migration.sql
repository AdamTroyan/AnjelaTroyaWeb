-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RENTED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';
