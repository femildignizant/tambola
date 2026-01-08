-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "markedNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
