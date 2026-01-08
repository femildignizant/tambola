import { describe, it, expect, vi } from "vitest";
import {
  getNextNumber,
  isGameComplete,
  getRemainingCount,
} from "./number-generator";

describe("getNextNumber", () => {
  it("should return a number between 1-90 when no numbers are called", () => {
    const num = getNextNumber([]);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(90);
  });

  it("should not return already called numbers", () => {
    const called = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50];
    const num = getNextNumber(called);
    expect(num).not.toBeNull();
    expect(called).not.toContain(num);
  });

  it("should return null when all 90 numbers have been called", () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const num = getNextNumber(allNumbers);
    expect(num).toBeNull();
  });

  it("should return null when more than 90 numbers are passed", () => {
    const extraNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
    const num = getNextNumber(extraNumbers);
    expect(num).toBeNull();
  });

  it("should return the only remaining number when 89 numbers are called", () => {
    // Call all numbers except 42
    const called = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      (n) => n !== 42
    );
    expect(called.length).toBe(89);

    const num = getNextNumber(called);
    expect(num).toBe(42);
  });

  it("should handle empty calledNumbers array", () => {
    const num = getNextNumber([]);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(90);
  });

  it("should only return numbers from the available pool", () => {
    const called = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 1-9 called
    const availableNumbers = Array.from({ length: 81 }, (_, i) => i + 10); // 10-90 available

    // Run multiple times to check randomness stays in bounds
    for (let i = 0; i < 100; i++) {
      const num = getNextNumber(called);
      expect(num).not.toBeNull();
      expect(availableNumbers).toContain(num);
      expect(called).not.toContain(num);
    }
  });
});

describe("isGameComplete", () => {
  it("should return false when no numbers are called", () => {
    expect(isGameComplete([])).toBe(false);
  });

  it("should return false when fewer than 90 numbers are called", () => {
    expect(isGameComplete([1, 2, 3])).toBe(false);
    expect(isGameComplete(Array.from({ length: 89 }, (_, i) => i + 1))).toBe(
      false
    );
  });

  it("should return true when exactly 90 numbers are called", () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    expect(isGameComplete(allNumbers)).toBe(true);
  });

  it("should return true when more than 90 numbers are passed (edge case)", () => {
    const extraNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(isGameComplete(extraNumbers)).toBe(true);
  });
});

describe("getRemainingCount", () => {
  it("should return 90 when no numbers are called", () => {
    expect(getRemainingCount([])).toBe(90);
  });

  it("should return correct count for partially called numbers", () => {
    expect(getRemainingCount([1, 2, 3])).toBe(87);
    expect(getRemainingCount([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(80);
  });

  it("should return 0 when all numbers are called", () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    expect(getRemainingCount(allNumbers)).toBe(0);
  });

  it("should return 0 for more than 90 numbers (edge case)", () => {
    const extraNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(getRemainingCount(extraNumbers)).toBe(0);
  });
});
