/*
  Warnings:

  - Added the required column `status` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "version" SET DEFAULT 1;
