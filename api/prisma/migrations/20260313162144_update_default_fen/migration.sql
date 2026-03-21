-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "ongoing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "result" TEXT,
ALTER COLUMN "currentFEN" SET DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
