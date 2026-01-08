import { describe, it, expect } from "vitest";
import { gamePatternSchema, gameSettingsSchema } from "./validation";

describe("Validation Schemas", () => {
  describe("gamePatternSchema", () => {
    const validPatternConfig = [
      {
        pattern: "FULL_HOUSE",
        points: 100,
        points1st: 100,
        enabled: true,
      },
      { pattern: "EARLY_FIVE", points: 50, points1st: 50, enabled: true },
    ];

    it("should pass with valid data", () => {
      const result = gamePatternSchema.parse({
        patterns: validPatternConfig,
      });
      expect(result).toBeDefined();
    });

    it("should fail when FULL_HOUSE is missing", () => {
      const invalidConfig = [
        {
          pattern: "EARLY_FIVE",
          points: 50,
          points1st: 50,
          enabled: true,
        },
      ];
      expect(() =>
        gamePatternSchema.parse({ patterns: invalidConfig })
      ).toThrow(/FULL_HOUSE/i);
    });

    it("should fail with negative points", () => {
      const invalidPoints = [
        {
          pattern: "FULL_HOUSE",
          points: -10,
          points1st: -10,
          enabled: true,
        },
      ];
      expect(() =>
        gamePatternSchema.parse({ patterns: invalidPoints })
      ).toThrow();
    });
  });

  describe("gameSettingsSchema", () => {
    const validSettings = {
      numberInterval: 10,
      minPlayers: 5,
      maxPlayers: 50,
    };

    it("should pass with valid settings", () => {
      const result = gameSettingsSchema.parse(validSettings);
      expect(result).toBeDefined();
    });

    it("should fail with invalid interval", () => {
      expect(() =>
        gameSettingsSchema.parse({
          ...validSettings,
          numberInterval: 5,
        })
      ).toThrow();
    });

    it("should fail when minPlayers > maxPlayers", () => {
      expect(() =>
        gameSettingsSchema.parse({
          ...validSettings,
          minPlayers: 60,
          maxPlayers: 50,
        })
      ).toThrow();
    });

    it("should fail when minPlayers < 2", () => {
      expect(() =>
        gameSettingsSchema.parse({ ...validSettings, minPlayers: 1 })
      ).toThrow();
    });

    it("should fail when maxPlayers > 75", () => {
      expect(() =>
        gameSettingsSchema.parse({ ...validSettings, maxPlayers: 80 })
      ).toThrow();
    });
  });
});
