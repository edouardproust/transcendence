/*
  Warnings:

  - Made the column `currentFen` on table `games` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pgn` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "games" ALTER COLUMN "currentFen" SET NOT NULL,
ALTER COLUMN "currentFen" SET DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
ALTER COLUMN "pgn" SET NOT NULL,
ALTER COLUMN "pgn" SET DEFAULT '';
