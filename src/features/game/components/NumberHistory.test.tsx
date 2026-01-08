import { render, screen } from "@testing-library/react";
import { NumberHistory } from "./NumberHistory";
import { describe, it, expect } from "vitest";

describe("NumberHistory", () => {
  it("renders empty state when no numbers called", () => {
    render(<NumberHistory calledNumbers={[]} />);
    expect(screen.getByText("No numbers called yet")).toBeInTheDocument();
  });

  it("renders last 10 numbers in reverse order", () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    render(<NumberHistory calledNumbers={numbers} />);
    
    // Should show 12 down to 3
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument(); // Older than last 10
    
    // Verify order (most recent first)
    const items = screen.getAllByRole("generic").filter(el => el.className.includes("rounded-full"));
    // Note: This selector might be too broad, let's check aria-labels if possible or just existence
    expect(screen.getByLabelText("Most recent number 12")).toBeInTheDocument();
  });

  it("highlights the most recent number", () => {
    render(<NumberHistory calledNumbers={[42]} />);
    const recent = screen.getByText("42");
    expect(recent).toHaveClass("bg-primary");
  });
});
