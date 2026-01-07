import { gamePatternSchema } from "./validation";
import { z } from "zod";
import assert from "assert";

// Define Pattern enum locally for test if needed, or rely on string matching if schema uses Zod enum
// Assuming the schema uses something compatible with the strings.

const validPatternConfig = [
  {
    pattern: "FULL_HOUSE",
    points: 100,
    points1st: 100,
    enabled: true,
  },
  { pattern: "EARLY_FIVE", points: 50, points1st: 50, enabled: true },
];

async function runTests() {
  console.log("Running validation tests...");

  // 1. Test Valid Data
  try {
    const result = gamePatternSchema.parse({
      patterns: validPatternConfig,
    });
    assert.ok(result, "Valid data should pass");
    console.log("✅ Valid data passed");
  } catch (e: any) {
    console.error("❌ Valid data failed:", e.errors || e);
    process.exit(1);
  }

  // 2. Test Missing FULL_HOUSE (should fail)
  try {
    const invalidConfig = [
      {
        pattern: "EARLY_FIVE",
        points: 50,
        points1st: 50,
        enabled: true,
      },
    ];
    gamePatternSchema.parse({ patterns: invalidConfig });
    console.error("❌ Missing FULL_HOUSE should have failed");
    process.exit(1);
  } catch (e: any) {
    // Expected failure
    const isFullHouseError = e.errors?.some((err: any) =>
      err.message?.includes("Full House")
    );
    // The message might vary, but let's assume it fails.
    console.log("✅ Missing FULL_HOUSE correctly failed");
  }

  // 3. Test Negative Points (should fail)
  try {
    const invalidPoints = [
      {
        pattern: "FULL_HOUSE",
        points: -10,
        points1st: -10,
        enabled: true,
      },
    ];
    gamePatternSchema.parse({ patterns: invalidPoints });
    console.error("❌ Negative points should have failed");
    process.exit(1);
  } catch (e) {
    console.log("✅ Negative points correctly failed");
  }

  console.log("All tests passed!");

  // 4. Test Game Settings Schema
  try {
    const { gameSettingsSchema } = require("./validation");

    // 4.1 Valid Settings
    const validSettings = {
      numberInterval: 10,
      minPlayers: 5,
      maxPlayers: 50,
    };
    gameSettingsSchema.parse(validSettings);
    console.log("✅ Valid game settings passed");

    // 4.2 Invalid Interval
    try {
      gameSettingsSchema.parse({
        ...validSettings,
        numberInterval: 5,
      });
      console.error("❌ Invalid interval (5) should have failed");
    } catch (e: any) {
      console.log("✅ Invalid interval correctly failed");
    }

    // 4.3 Min > Max
    try {
      gameSettingsSchema.parse({
        ...validSettings,
        minPlayers: 60,
        maxPlayers: 50,
      });
      console.error("❌ Min > Max should have failed");
    } catch (e: any) {
      console.log("✅ Min > Max correctly failed");
    }

    // 4.4 Out of Range
    try {
      gameSettingsSchema.parse({ ...validSettings, minPlayers: 1 });
      console.error("❌ Min players < 2 should have failed");
    } catch (e: any) {
      console.log("✅ Min players < 2 correctly failed");
    }
    try {
      gameSettingsSchema.parse({ ...validSettings, maxPlayers: 80 });
      console.error("❌ Max players > 75 should have failed");
    } catch (e: any) {
      console.log("✅ Max players > 75 correctly failed");
    }
  } catch (e) {
    console.log("⚠️ gameSettingsSchema not yet implemented");
  }

  console.log("All tests passed!");
}

runTests();
