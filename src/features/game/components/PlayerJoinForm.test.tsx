import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { PlayerJoinForm } from "./PlayerJoinForm";

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

describe("PlayerJoinForm", () => {
  const mockGameId = "test-game-123";
  const mockOnJoinSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
  });



  it("should render join form with name input", () => {
    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Join Game" })
    ).toBeDefined();
    expect(screen.getByLabelText("Your Name")).toBeDefined();
    expect(
      screen.getByRole("button", { name: /join game/i })
    ).toBeDefined();
  });

  it("should show error for empty name", async () => {
    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter your name")
      ).toBeDefined();
    });
  });

  it("should show error for name longer than 20 characters", async () => {
    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const input = screen.getByLabelText("Your Name");
    fireEvent.change(input, {
      target: { value: "This name is way too long for validation" },
    });

    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Name must be 20 characters or less")
      ).toBeDefined();
    });
  });

  it("should call API and handle successful join", async () => {
    const mockResponse = {
      data: {
        player: {
          id: "player-1",
          name: "Test Player",
          joinedAt: new Date().toISOString(),
        },
        ticket: {
          id: "ticket-1",
          grid: [
            [1, 0, 23, 0, 45, 0, 67, 0, 89],
            [2, 0, 24, 0, 46, 0, 68, 0, 90],
            [3, 0, 25, 0, 47, 0, 69, 0, 88],
          ],
        },
        token: "test-token-123",
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const input = screen.getByLabelText("Your Name");
    fireEvent.change(input, { target: { value: "Test Player" } });

    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/games/${mockGameId}/join`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test Player" }),
        })
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `game-${mockGameId}-token`,
        "test-token-123"
      );
      expect(mockOnJoinSuccess).toHaveBeenCalledWith(
        mockResponse.data
      );
    });
  });

  it("should handle API error", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Game is full" }),
    } as Response);

    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const input = screen.getByLabelText("Your Name");
    fireEvent.change(input, { target: { value: "Test Player" } });

    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Game is full")).toBeDefined();
      expect(mockOnJoinSuccess).not.toHaveBeenCalled();
    });
  });

  it("should handle network error", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const input = screen.getByLabelText("Your Name");
    fireEvent.change(input, { target: { value: "Test Player" } });

    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Network error. Please try again.")
      ).toBeDefined();
      expect(mockOnJoinSuccess).not.toHaveBeenCalled();
    });
  });

  it("should disable form during submission", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(global.fetch).mockReturnValueOnce(promise as any);

    render(
      <PlayerJoinForm
        gameId={mockGameId}
        onJoinSuccess={mockOnJoinSuccess}
      />
    );

    const input = screen.getByLabelText(
      "Your Name"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /join game/i,
    }) as HTMLButtonElement;

    fireEvent.change(input, { target: { value: "Test Player" } });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText("Joining...")).toBeDefined();
    });

    const loadingInput = screen.getByLabelText(
      "Your Name"
    ) as HTMLInputElement;
    const loadingButton = screen.getByRole("button", {
      name: /joining/i,
    }) as HTMLButtonElement;

    expect(loadingInput.disabled).toBe(true);
    expect(loadingButton.disabled).toBe(true);

    // Resolve the promise to cleanup
    resolvePromise({
      ok: true,
      json: async () => ({
        data: {
          player: {
            id: "p1",
            name: "Test Player",
            joinedAt: new Date().toISOString(),
          },
          ticket: { id: "t1", grid: [] },
          token: "token",
        },
      }),
    });
  });
});
