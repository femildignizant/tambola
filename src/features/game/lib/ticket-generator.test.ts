import { describe, it, expect } from "vitest";
import { generateTicket } from "./ticket-generator";
import { TICKET_COLUMN_RANGES } from "../types";

describe("Tambola Ticket Generator", () => {
  it("should generate a valid 3x9 ticket structure", () => {
    const ticket = generateTicket();
    expect(ticket).toHaveLength(3);
    expect(ticket[0]).toHaveLength(9);
    expect(ticket[1]).toHaveLength(9);
    expect(ticket[2]).toHaveLength(9);
  });

  it("should have exactly 15 numbers in total", () => {
    const ticket = generateTicket();
    const numbers = ticket
      .flat()
      .filter((cell: number | null) => cell !== null);
    expect(numbers).toHaveLength(15);
  });

  it("should have exactly 5 numbers per row", () => {
    const ticket = generateTicket();
    ticket.forEach((row: (number | null)[]) => {
      const numbersInRow = row.filter(
        (cell: number | null) => cell !== null
      );
      expect(numbersInRow).toHaveLength(5);
    });
  });

  it("should have numbers within valid column ranges", () => {
    const ticket = generateTicket();
    for (let col = 0; col < 9; col++) {
      const colNumbers = [
        ticket[0][col],
        ticket[1][col],
        ticket[2][col],
      ].filter((cell) => cell !== null);

      const range = TICKET_COLUMN_RANGES[col];
      colNumbers.forEach((num) => {
        if (num !== null) {
          expect(num).toBeGreaterThanOrEqual(range.min);
          expect(num).toBeLessThanOrEqual(range.max);
        }
      });
    }
  });

  it("should have numbers sorted in ascending order within each column", () => {
    const ticket = generateTicket();
    for (let col = 0; col < 9; col++) {
      const colNumbers = [
        ticket[0][col],
        ticket[1][col],
        ticket[2][col],
      ].filter((cell) => cell !== null) as number[];

      const sortedNumbers = [...colNumbers].sort((a, b) => a - b);
      expect(colNumbers).toEqual(sortedNumbers);
    }
  });

  it("should have no duplicate numbers across the ticket", () => {
    const ticket = generateTicket();
    const numbers = ticket
      .flat()
      .filter((cell: number | null) => cell !== null);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(15);
  });

  it("should have at least 1 number in every column", () => {
    // Note: Standard Tambola rule is every column has at least one number
    // Implicitly enforced by (15 numbers in 9 columns, max 3 per col, usually distributed)
    // But technically we just need to satisfy row constraints.
    // However, AC says "numbers within specific ranges", let's ensure generator is decent.
    // Let's verify no empty columns if that's a requirement.
    // Actually, standard tickets always populate every column? No, 15 numbers in 9 cols.
    // Pigeonhole principle says 9 cols, 15 items -> some cols have multiple.
    // Min 1 per col is a standard "good ticket" rule. Let's enforce it as per Dev Notes.
    const ticket = generateTicket();
    for (let col = 0; col < 9; col++) {
      const colNumbers = [
        ticket[0][col],
        ticket[1][col],
        ticket[2][col],
      ].filter((n) => n !== null);
      expect(colNumbers.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should generate robustly (bulk test)", () => {
    for (let i = 0; i < 100; i++) {
      const ticket = generateTicket();

      // Full validation for every ticket

      // 1. Structure
      expect(ticket).toHaveLength(3);
      ticket.forEach((row: (number | null)[]) => {
        expect(row).toHaveLength(9);
      });

      // 2. Counts
      const allNumbers = ticket
        .flat()
        .filter((n: number | null): n is number => n !== null);
      expect(allNumbers).toHaveLength(15);

      ticket.forEach((row: (number | null)[]) => {
        const rowNums = row.filter(
          (n: number | null): n is number => n !== null
        );
        expect(rowNums).toHaveLength(5);
      });

      // 3. Columns (Ranges & Sorting)
      for (let c = 0; c < 9; c++) {
        const colNums = [
          ticket[0][c],
          ticket[1][c],
          ticket[2][c],
        ].filter((n: number | null): n is number => n !== null);

        // At least one per col
        expect(colNums.length).toBeGreaterThanOrEqual(1);

        // Ranges
        const range = TICKET_COLUMN_RANGES[c];
        colNums.forEach((n: number) => {
          expect(n).toBeGreaterThanOrEqual(range.min);
          expect(n).toBeLessThanOrEqual(range.max);
        });

        // Sorting
        const sorted = [...colNums].sort((a, b) => a - b);
        expect(colNums).toEqual(sorted);
      }

      // 4. Uniqueness
      const unique = new Set(allNumbers);
      expect(unique.size).toBe(15);
    }
  });
});
