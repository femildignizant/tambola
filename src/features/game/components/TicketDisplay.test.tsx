import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketDisplay } from "./TicketDisplay";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("lucide-react", () => ({
  Ticket: () => <svg data-testid="ticket-icon" />,
}));

describe("TicketDisplay", () => {
  const validGrid = [
    [1, 0, 23, 0, 45, 0, 67, 0, 89],
    [2, 0, 24, 0, 46, 0, 68, 0, 90],
    [3, 0, 25, 0, 47, 0, 69, 0, 88],
  ];

  it("should render ticket with valid grid", () => {
    render(<TicketDisplay grid={validGrid} />);

    expect(screen.getByText("Your Ticket")).toBeDefined();
    expect(
      screen.getByText("Tambola Ticket - 3 rows × 9 columns")
    ).toBeDefined();
  });

  it("should render player name when provided", () => {
    render(
      <TicketDisplay grid={validGrid} playerName="Test Player" />
    );

    expect(screen.getByText("Test Player's Ticket")).toBeDefined();
  });

  it("should display all numbers from grid", () => {
    render(<TicketDisplay grid={validGrid} />);

    // Check for some numbers from the grid
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("23")).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("67")).toBeDefined();
    expect(screen.getByText("89")).toBeDefined();
  });

  it("should render empty cells for zeros", () => {
    const { container } = render(<TicketDisplay grid={validGrid} />);

    // Count cells with empty content (zeros)
    const cells = container.querySelectorAll(
      "div[class*='aspect-square']"
    );
    const emptyCells = Array.from(cells).filter(
      (cell) => cell.textContent === ""
    );

    // Each row has 4 empty cells (9 columns - 5 numbers = 4 empty)
    // 3 rows × 4 empty cells = 12 empty cells
    expect(emptyCells.length).toBe(12);
  });

  it("should handle invalid grid structure - wrong number of rows", () => {
    const invalidGrid = [
      [1, 0, 23, 0, 45, 0, 67, 0, 89],
      [2, 0, 24, 0, 46, 0, 68, 0, 90],
    ]; // Only 2 rows instead of 3

    render(<TicketDisplay grid={invalidGrid as any} />);
    expect(screen.getByText("Invalid ticket data")).toBeDefined();
  });

  it("should handle invalid grid structure - wrong number of columns", () => {
    const invalidGrid = [
      [1, 0, 23, 0, 45],
      [2, 0, 24, 0, 46],
      [3, 0, 25, 0, 47],
    ]; // Only 5 columns instead of 9

    render(<TicketDisplay grid={invalidGrid as any} />);

    expect(screen.getByText("Invalid ticket data")).toBeDefined();
  });

  it("should handle null grid", () => {
    render(<TicketDisplay grid={null as any} />);

    expect(screen.getByText("Invalid ticket data")).toBeDefined();
  });

  it("should handle undefined grid", () => {
    render(<TicketDisplay grid={undefined as any} />);

    expect(screen.getByText("Invalid ticket data")).toBeDefined();
  });

  it("should render 3 rows and 9 columns", () => {
    const { container } = render(<TicketDisplay grid={validGrid} />);

    // Check for 3 rows
    const rows = container.querySelectorAll(
      "div[class*='grid-rows-3'] > div"
    );
    expect(rows.length).toBe(3);

    // Check that each row has 9 columns
    rows.forEach((row) => {
      const cols = row.querySelectorAll(
        "div[class*='aspect-square']"
      );
      expect(cols.length).toBe(9);
    });
  });

  it("should apply different styling to filled vs empty cells", () => {
    const { container } = render(<TicketDisplay grid={validGrid} />);

    const cells = container.querySelectorAll(
      "div[class*='aspect-square']"
    );

    // Find a filled cell (contains number)
    const filledCell = Array.from(cells).find(
      (cell) => cell.textContent === "1"
    );
    expect(filledCell?.className).toContain("bg-background");
    expect(filledCell?.className).toContain("border");

    // Find an empty cell (no number)
    const emptyCell = Array.from(cells).find(
      (cell) => cell.textContent === ""
    );
    expect(emptyCell?.className).toContain("bg-muted");
  });
});
