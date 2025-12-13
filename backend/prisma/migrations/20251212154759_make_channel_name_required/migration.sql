/*
  Warnings:

  - Made the column `channel_name` on table `creator_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "creator_profiles" ALTER COLUMN "channel_name" SET NOT NULL;
