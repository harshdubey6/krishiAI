/*
  Warnings:

  - You are about to drop the column `plantType` on the `Diagnosis` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cropType` to the `Diagnosis` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
-- Step 1: Add new columns (cropType as nullable first)
ALTER TABLE "public"."Diagnosis" 
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "cropType" TEXT,
ADD COLUMN     "estimatedCost" DOUBLE PRECISION,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "severity" TEXT;

-- Step 2: Copy data from plantType to cropType for existing records
UPDATE "public"."Diagnosis" 
SET "cropType" = "plantType" 
WHERE "plantType" IS NOT NULL;

-- Step 3: Make cropType required
ALTER TABLE "public"."Diagnosis" 
ALTER COLUMN "cropType" SET NOT NULL;

-- Step 4: Drop the old plantType column
ALTER TABLE "public"."Diagnosis" 
DROP COLUMN "plantType";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "district" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'farmer',
ADD COLUMN     "state" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Farm" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "areaAcres" DOUBLE PRECISION NOT NULL,
    "soilType" TEXT,
    "waterSource" TEXT,
    "village" TEXT,
    "district" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CropListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "variety" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'quintal',
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "quality" TEXT,
    "organic" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3),
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveryType" TEXT,
    "deliveryAddress" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MarketPrice" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "modalPrice" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "feelsLike" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "condition" TEXT NOT NULL,
    "forecast" JSONB,
    "alerts" TEXT[],
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiagnosisRating" (
    "id" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "helpful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CropGuide" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "climate" TEXT,
    "soilType" TEXT,
    "sowing" TEXT,
    "irrigation" TEXT,
    "fertilizer" TEXT,
    "pests" TEXT,
    "diseases" TEXT,
    "harvesting" TEXT,
    "yield" TEXT,
    "videoUrls" TEXT[],
    "imageUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CropListing_cropName_state_status_idx" ON "public"."CropListing"("cropName", "state", "status");

-- CreateIndex
CREATE INDEX "MarketPrice_cropName_state_date_idx" ON "public"."MarketPrice"("cropName", "state", "date");

-- CreateIndex
CREATE INDEX "WeatherLog_location_loggedAt_idx" ON "public"."WeatherLog"("location", "loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisRating_diagnosisId_key" ON "public"."DiagnosisRating"("diagnosisId");

-- CreateIndex
CREATE UNIQUE INDEX "CropGuide_cropName_key" ON "public"."CropGuide"("cropName");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- AddForeignKey
ALTER TABLE "public"."Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CropListing" ADD CONSTRAINT "CropListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."CropListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeatherLog" ADD CONSTRAINT "WeatherLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiagnosisRating" ADD CONSTRAINT "DiagnosisRating_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "public"."Diagnosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
