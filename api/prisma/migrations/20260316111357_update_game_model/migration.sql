/*
  Warnings:

  - You are about to drop the column `ongoing` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `Game` table. All the data in the column will be lost.
  - Added the required column `mode` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeControl` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'ONGOING', 'FINISHED', 'ABORTED');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('ONLINE', 'AI');

-- CreateEnum
CREATE TYPE "TimeControl" AS ENUM ('BULLET', 'BLITZ', 'RAPID', 'CLASSICAL', 'UNLIMITED');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_blackId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "ongoing",
DROP COLUMN "result",
ADD COLUMN     "increment" INTEGER,
ADD COLUMN     "initialTime" INTEGER,
ADD COLUMN     "mode" "GameMode" NOT NULL,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
ADD COLUMN     "timeControl" "TimeControl" NOT NULL,
ALTER COLUMN "blackId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
