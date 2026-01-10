import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DocsPage from "./page";

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

describe("DocsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<DocsPage />);
    expect(container).toBeInTheDocument();
  });

  it("renders two guide cards", () => {
    const { container } = render(<DocsPage />);
    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(2);
  });

  it("renders link to host guide", () => {
    render(<DocsPage />);
    const link = screen.getByRole("link", {
      name: /read host guide/i,
    });
    expect(link).toHaveAttribute("href", "/docs/host");
  });

  it("renders link to player guide", () => {
    render(<DocsPage />);
    const link = screen.getByRole("link", {
      name: /read player guide/i,
    });
    expect(link).toHaveAttribute("href", "/docs/player");
  });

  it("renders quick links section", () => {
    const { container } = render(<DocsPage />);
    const quickLinks = container.querySelectorAll(
      'section a[href*="#"]'
    );
    expect(quickLinks.length).toBe(4); // 4 quick links
  });
});
