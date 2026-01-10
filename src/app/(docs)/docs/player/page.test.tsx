import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PlayerGuidePage from "./page";

describe("PlayerGuidePage", () => {
  it("renders without crashing", () => {
    const { container } = render(<PlayerGuidePage />);
    expect(container).toBeInTheDocument();
  });

  it("renders the main article element", () => {
    const { container } = render(<PlayerGuidePage />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders all main section headings", () => {
    const { container } = render(<PlayerGuidePage />);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBeGreaterThanOrEqual(6); // At least 6 h2 headings
  });

  it("renders the h1 heading", () => {
    const { container } = render(<PlayerGuidePage />);
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe("Player Guide");
  });

  it("renders sections with proper id anchors", () => {
    const { container } = render(<PlayerGuidePage />);
    expect(container.querySelector("#joining")).toBeInTheDocument();
    expect(container.querySelector("#ticket")).toBeInTheDocument();
    expect(container.querySelector("#patterns")).toBeInTheDocument();
    expect(container.querySelector("#marking")).toBeInTheDocument();
    expect(container.querySelector("#claims")).toBeInTheDocument();
    expect(container.querySelector("#tips")).toBeInTheDocument();
  });

  it("renders PatternVisual components (6 patterns)", () => {
    const { container } = render(<PlayerGuidePage />);
    // PatternVisual has a grid with rows-3
    const patternGrids = container.querySelectorAll(
      ".grid.grid-rows-3"
    );
    expect(patternGrids.length).toBe(6);
  });
});
