-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_whiteId_fkey";

-- AlterTable
ALTER TABLE "games" ALTER COLUMN "whiteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
