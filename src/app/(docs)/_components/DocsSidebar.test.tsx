import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DocsSidebar } from "./DocsSidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/docs"),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

describe("DocsSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = render(<DocsSidebar />);
    expect(container).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<DocsSidebar />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(5);
  });

  it("renders link to host guide", () => {
    render(<DocsSidebar />);
    const hostLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/docs/host");
    expect(hostLinks.length).toBeGreaterThan(0);
  });

  it("renders link to player guide", () => {
    render(<DocsSidebar />);
    const playerLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/docs/player");
    expect(playerLinks.length).toBeGreaterThan(0);
  });

  it("renders back to dashboard link", () => {
    render(<DocsSidebar />);
    const dashboardLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/dashboard");
    expect(dashboardLinks.length).toBe(1);
  });
});
