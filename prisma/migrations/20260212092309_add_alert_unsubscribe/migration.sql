/*
  Warnings:

  - A unique constraint covering the columns `[unsubscribeToken]` on the table `PropertyAlert` will be added. If there are existing duplicate values, this will fail.
  - The required column `unsubscribeToken` was added to the `PropertyAlert` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "PropertyAlert" ADD COLUMN     "unsubscribeToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAlert_unsubscribeToken_key" ON "PropertyAlert"("unsubscribeToken");
