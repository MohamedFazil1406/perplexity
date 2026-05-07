/*
  Warnings:

  - You are about to drop the column `supabase` on the `User` table. All the data in the column will be lost.
  - Added the required column `supabaseId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "supabase",
ADD COLUMN     "supabaseId" TEXT NOT NULL;
