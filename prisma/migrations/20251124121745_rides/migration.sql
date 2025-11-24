/*
  Warnings:

  - Added the required column `type` to the `rides` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RideType" AS ENUM ('BIKE', 'BIKE_LITE', 'AUTO', 'CAB');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'WALLET');

-- AlterTable
ALTER TABLE "rides" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "payment_method" "PaymentMethod",
ADD COLUMN     "type" "RideType" NOT NULL;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "ride_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_ride_id_key" ON "reviews"("ride_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
