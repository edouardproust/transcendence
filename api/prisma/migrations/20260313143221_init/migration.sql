/*
  Warnings:

  - Added the required column `currentFEN` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movesPGN` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentFEN" TEXT NOT NULL,
ADD COLUMN     "movesPGN" TEXT NOT NULL;
