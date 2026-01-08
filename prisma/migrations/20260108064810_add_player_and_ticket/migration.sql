/*
  Warnings:

  - You are about to drop the `InitCheck` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InitCheck";

-- CreateTable
CREATE TABLE "player" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "socketId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "grid" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_gameId_idx" ON "player"("gameId");

-- CreateIndex
CREATE INDEX "player_userId_idx" ON "player"("userId");

-- CreateIndex
CREATE INDEX "ticket_playerId_idx" ON "ticket"("playerId");

-- CreateIndex
CREATE INDEX "ticket_gameId_idx" ON "ticket"("gameId");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
