-- AlterTable
ALTER TABLE "game" ADD COLUMN     "calledNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "currentSequence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startedAt" TIMESTAMP(3);
