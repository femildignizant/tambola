import { render, screen } from "@testing-library/react";
import { NumberDisplay } from "./NumberDisplay";
import { describe, it, expect } from "vitest";

describe("NumberDisplay", () => {
  it("renders waiting state when currentNumber is null", () => {
    render(<NumberDisplay currentNumber={null} />);
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
  });

  it("renders the current number", () => {
    render(<NumberDisplay currentNumber={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByLabelText("Current number is 42")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<NumberDisplay currentNumber={42} className="test-class" />);
    expect(container.firstChild).toHaveClass("test-class");
  });
});
