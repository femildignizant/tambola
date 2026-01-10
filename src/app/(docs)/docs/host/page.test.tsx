import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HostGuidePage from "./page";

describe("HostGuidePage", () => {
  it("renders without crashing", () => {
    const { container } = render(<HostGuidePage />);
    expect(container).toBeInTheDocument();
  });

  it("renders the main article element", () => {
    const { container } = render(<HostGuidePage />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders all main section headings", () => {
    const { container } = render(<HostGuidePage />);
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBeGreaterThanOrEqual(6); // At least 6 h2 headings
  });

  it("renders the h1 heading", () => {
    const { container } = render(<HostGuidePage />);
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe("Host Guide");
  });

  it("renders sections with proper id anchors", () => {
    const { container } = render(<HostGuidePage />);
    expect(
      container.querySelector("#getting-started")
    ).toBeInTheDocument();
    expect(
      container.querySelector("#creating-a-game")
    ).toBeInTheDocument();
    expect(
      container.querySelector("#customization")
    ).toBeInTheDocument();
    expect(container.querySelector("#sharing")).toBeInTheDocument();
    expect(container.querySelector("#managing")).toBeInTheDocument();
    expect(
      container.querySelector("#completion")
    ).toBeInTheDocument();
  });
});
