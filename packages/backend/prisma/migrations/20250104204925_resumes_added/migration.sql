/*
  Warnings:

  - You are about to drop the column `file` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "file",
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");
