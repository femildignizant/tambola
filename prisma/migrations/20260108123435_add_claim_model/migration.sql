-- CreateTable
CREATE TABLE "claim" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "pattern" "Pattern" NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "claim_gameId_idx" ON "claim"("gameId");

-- CreateIndex
CREATE INDEX "claim_playerId_idx" ON "claim"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_gameId_pattern_rank_key" ON "claim"("gameId", "pattern", "rank");

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
