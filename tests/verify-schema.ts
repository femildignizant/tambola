import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { GameStatus, Pattern } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting Schema Verification...");

  // 1. Create a Host User
  const host = await prisma.user.create({
    data: {
      name: "Schema Tester",
      email: `schema-tester-${Date.now()}@example.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("Created Host:", host.id);

  try {
    // 2. Create Game
    const game = await prisma.game.create({
      data: {
        title: "Test Game",
        hostId: host.id,
        gameCode: "TEST01",
        minPlayers: 5,
        maxPlayers: 50,
      },
    });
    console.log("Created Game:", game.id);

    // Verify Defaults
    if (game.status !== GameStatus.CONFIGURING)
      throw new Error("Default Status mismatch");
    if (game.numberInterval !== 10)
      throw new Error("Default Interval mismatch");

    // 3. Create GamePattern
    const gp = await prisma.gamePattern.create({
      data: {
        gameId: game.id,
        pattern: Pattern.FULL_HOUSE,
        points1st: 500,
      },
    });
    console.log("Created GamePattern:", gp.id);

    // 4. Verify Unique Constraint on GamePattern (gameId, pattern)
    try {
      await prisma.gamePattern.create({
        data: {
          gameId: game.id,
          pattern: Pattern.FULL_HOUSE,
        },
      });
      throw new Error("Failed to enforce GamePattern uniqueness");
    } catch (e: any) {
      if (e.code === "P2002") {
        console.log("Verified GamePattern uniqueness");
      } else {
        throw e;
      }
    }

    // 5. Verify Unique GameCode
    try {
      await prisma.game.create({
        data: {
          title: "Duplicate Code Game",
          hostId: host.id,
          gameCode: "TEST01",
        },
      });
      throw new Error("Failed to enforce GameCode uniqueness");
    } catch (e: any) {
      if (e.code === "P2002") {
        console.log("Verified GameCode uniqueness");
      } else {
        throw e;
      }
    }

    // 6. Verify Cascade Delete
    await prisma.game.delete({
      where: { id: game.id },
    });

    const patterns = await prisma.gamePattern.count({
      where: { gameId: game.id },
    });
    if (patterns !== 0) throw new Error("Cascade delete failed");
    console.log("Verified Cascade Delete");
  } finally {
    // Clean up
    await prisma.user.delete({
      where: { id: host.id },
    });
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("Schema Verification Passed"))
  .catch((e) => {
    console.error("Schema Verification Failed:", e);
    process.exit(1);
  });
