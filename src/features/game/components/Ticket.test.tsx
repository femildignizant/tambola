/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import { Ticket } from "./Ticket";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useGameStore,
  type GameStore,
} from "@/features/game/game-store";

// Mock the store hook
vi.mock("@/features/game/game-store");

describe("Ticket", () => {
  const mockGrid = [
    [1, 2, 3, 4, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 15, 16, 17, 18, 19],
    [21, 22, 23, 24, 0, 0, 0, 0, 90],
  ];

  const mockToggleMark = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useGameStore).mockReturnValue({
      markedNumbers: [],
      toggleMark: mockToggleMark,
    } as unknown as GameStore);
  });

  it("renders the grid numbers correctly", () => {
    render(<Ticket grid={mockGrid} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    // 0s should not be rendered as text 0 (implementation details check: Empty cell bg-transparent)
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calls toggleMark when a number is clicked", () => {
    render(<Ticket grid={mockGrid} />);
    fireEvent.click(screen.getByText("1"));
    expect(mockToggleMark).toHaveBeenCalledWith(1);
  });

  it("visually indicates marked numbers", () => {
    // Override mock for this test
    vi.mocked(useGameStore).mockReturnValue({
      markedNumbers: [1, 90],
      toggleMark: mockToggleMark,
    } as unknown as GameStore);

    render(<Ticket grid={mockGrid} />);

    // Check for marked styling (bg-primary)
    // The component applies "bg-primary" to marked cells
    const markedCell1 = screen.getByText("1");

    // Note: We check specifically for the class that indicates marking
    expect(markedCell1).toHaveClass("bg-primary");

    const unmarkedCell = screen.getByText("2");
    expect(unmarkedCell).not.toHaveClass("bg-primary");
  });

  it("does not auto-highlight based on anything other than markedNumbers", () => {
    // This test conceptually verifies that simply rendering doesn't mark
    // numbers unless they are in the store's markedNumbers.
    vi.mocked(useGameStore).mockReturnValue({
      markedNumbers: [],
      toggleMark: mockToggleMark,
    } as unknown as GameStore);

    render(<Ticket grid={mockGrid} />);
    const cell = screen.getByText("1");
    expect(cell).not.toHaveClass("bg-primary");
  });

  it("calls toggleMark when Enter or Space is pressed", () => {
    render(<Ticket grid={mockGrid} />);
    const cell = screen.getByText("1");

    // Press Enter
    fireEvent.keyDown(cell, { key: "Enter" });
    expect(mockToggleMark).toHaveBeenCalledWith(1);

    // Press Space
    fireEvent.keyDown(cell, { key: " " });
    expect(mockToggleMark).toHaveBeenCalledTimes(2);

    // Other keys shouldn't trigger
    fireEvent.keyDown(cell, { key: "a" });
    expect(mockToggleMark).toHaveBeenCalledTimes(2);
  });
});
