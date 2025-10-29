/*
  Warnings:

  - You are about to drop the column `condition` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `Diagnosis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Diagnosis" DROP COLUMN "condition",
DROP COLUMN "confidence",
DROP COLUMN "recommendations",
ADD COLUMN     "causes" TEXT[],
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "prevention" TEXT[],
ADD COLUMN     "treatment" TEXT[];
