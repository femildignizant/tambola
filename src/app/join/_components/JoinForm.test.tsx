import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JoinForm } from "./JoinForm";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock sonner
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("JoinForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Behavior (AC #7)", () => {
    it("should auto-focus input on mount", () => {
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });
      expect(document.activeElement).toBe(input);
    });

    it("should auto-uppercase input", async () => {
      const user = userEvent.setup();
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "abc123");
      expect(input).toHaveValue("ABC123");
    });

    it("should limit input to 6 characters", async () => {
      const user = userEvent.setup();
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABCD1234567");
      expect(input).toHaveValue("ABCD12");
    });

    it("should only allow alphanumeric characters", async () => {
      const user = userEvent.setup();
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "AB-C@1#2");
      expect(input).toHaveValue("ABC12");
    });

    it("should show character count", () => {
      render(<JoinForm />);
      expect(screen.getByText("0/6 characters")).toBeInTheDocument();
    });

    it("should update character count as user types", async () => {
      const user = userEvent.setup();
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABC");
      expect(screen.getByText("3/6 characters")).toBeInTheDocument();
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button when code is less than 6 characters", () => {
      render(<JoinForm />);
      const button = screen.getByRole("button", {
        name: /join game/i,
      });
      expect(button).toBeDisabled();
    });

    it("should enable submit button when code is exactly 6 characters", async () => {
      const user = userEvent.setup();
      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABC123");
      const button = screen.getByRole("button", {
        name: /join game/i,
      });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("should call lookup API on submit", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { gameId: "game-123" } }),
      });

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABC123");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      expect(mockFetch).toHaveBeenCalledWith("/api/games/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "ABC123" }),
      });
    });

    it("should redirect to game lobby on success", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { gameId: "game-456" } }),
      });

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "XYZ789");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/game/game-456");
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: { gameId: "game-123" },
                  }),
                }),
              100
            )
          )
      );

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABC123");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      expect(screen.getByText("Finding Game...")).toBeInTheDocument();
    });

    it("should show toast error on API error", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Game not found. Check your code and try again.",
        }),
      });

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "BADCOD");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Game not found. Check your code and try again."
        );
      });
    });

    it("should show network error on fetch failure", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "ABC123");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Network error. Please try again."
        );
      });
    });

    it("should not clear input on error (AC #3)", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Game not found" }),
      });

      render(<JoinForm />);
      const input = screen.getByRole("textbox", {
        name: /game code/i,
      });

      await user.type(input, "BADCOD");
      await user.click(
        screen.getByRole("button", { name: /join game/i })
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      // Input should still have the value
      expect(input).toHaveValue("BADCOD");
    });
  });
});
