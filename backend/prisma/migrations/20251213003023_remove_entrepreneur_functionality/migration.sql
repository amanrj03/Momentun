/*
  Warnings:

  - You are about to drop the column `entrepreneur_id` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the `entrepreneurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "videos" DROP CONSTRAINT "videos_entrepreneur_id_fkey";

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "entrepreneur_id";

-- DropTable
DROP TABLE "entrepreneurs";
