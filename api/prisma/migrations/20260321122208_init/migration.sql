/*
  Warnings:

  - The primary key for the `games` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_blackId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_userId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_whiteId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_winnerId_fkey";

-- AlterTable
ALTER TABLE "games" DROP CONSTRAINT "games_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "whiteId" SET DATA TYPE TEXT,
ALTER COLUMN "blackId" SET DATA TYPE TEXT,
ALTER COLUMN "winnerId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "games_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
