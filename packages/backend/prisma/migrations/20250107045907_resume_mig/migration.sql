/*
  Warnings:

  - You are about to drop the `resume_parses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resumes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "resume_parses" DROP CONSTRAINT "resume_parses_resume_id_fkey";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "parsedData" JSONB;

-- DropTable
DROP TABLE "resume_parses";

-- DropTable
DROP TABLE "resumes";
