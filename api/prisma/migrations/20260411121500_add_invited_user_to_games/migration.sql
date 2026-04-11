-- AlterTable
ALTER TABLE "games" ADD COLUMN "invitedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "games"
ADD CONSTRAINT "games_invitedUserId_fkey"
FOREIGN KEY ("invitedUserId") REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
