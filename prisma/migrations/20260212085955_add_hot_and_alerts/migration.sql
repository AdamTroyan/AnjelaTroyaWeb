-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isHot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PropertyAlert" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "minRooms" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyAlert_pkey" PRIMARY KEY ("id")
);
