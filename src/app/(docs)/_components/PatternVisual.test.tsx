import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PatternVisual } from "./PatternVisual";

describe("PatternVisual", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <PatternVisual
        pattern="EARLY_FIVE"
        title="Early Five"
        description="First 5 numbers"
      />
    );
    expect(container).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(
      <PatternVisual
        pattern="EARLY_FIVE"
        title="Early Five"
        description="First 5 numbers"
      />
    );
    expect(screen.getByText("Early Five")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <PatternVisual
        pattern="TOP_ROW"
        title="Top Row"
        description="All 5 numbers in the first row"
      />
    );
    expect(
      screen.getByText("All 5 numbers in the first row")
    ).toBeInTheDocument();
  });

  it("renders a 3x9 grid (27 cells)", () => {
    const { container } = render(
      <PatternVisual
        pattern="EARLY_FIVE"
        title="Early Five"
        description="Test"
      />
    );
    const cells = container.querySelectorAll(".aspect-square");
    expect(cells.length).toBe(27);
  });

  it("renders the legend", () => {
    render(
      <PatternVisual
        pattern="TOP_ROW"
        title="Top Row"
        description="Test"
      />
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Number")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});
