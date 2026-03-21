/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_blackId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_whiteId_fkey";

-- DropTable
DROP TABLE "Game";

-- DropEnum
DROP TYPE "TimeControl";

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "mode" "GameMode" NOT NULL DEFAULT 'ONLINE',
    "whiteId" INTEGER NOT NULL,
    "blackId" INTEGER,
    "winnerId" INTEGER,
    "currentFen" TEXT,
    "pgn" TEXT,
    "timeControl" TEXT NOT NULL DEFAULT 'unlimited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
