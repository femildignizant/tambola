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
  act,
} from "@testing-library/react";
import { HostStartButton } from "./HostStartButton";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock pusher client
const mockBind = vi.fn();
const mockUnbindAll = vi.fn();
const mockUnsubscribe = vi.fn();
const mockSubscribe = vi.fn(() => ({
  bind: mockBind,
  unbind_all: mockUnbindAll,
}));

vi.mock("@/lib/pusher-client", () => ({
  pusherClient: {
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  },
}));

describe("HostStartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    gameId: "game-123",
    currentPlayerCount: 5,
    minPlayers: 2,
    isHost: true,
  };

  it("should render start button when user is host", () => {
    render(<HostStartButton {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /start game/i })
    ).toBeInTheDocument();
  });

  it("should not render anything when user is not host", () => {
    const { container } = render(
      <HostStartButton {...defaultProps} isHost={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should be enabled when minimum players are met", () => {
    render(<HostStartButton {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: /start game/i,
    });
    expect(button).not.toBeDisabled();
  });

  it("should be disabled when minimum players are not met", () => {
    render(
      <HostStartButton
        {...defaultProps}
        currentPlayerCount={1}
        minPlayers={5}
      />
    );

    const button = screen.getByRole("button", {
      name: /start game/i,
    });
    expect(button).toBeDisabled();
  });

  it("should show player count status", () => {
    render(
      <HostStartButton
        {...defaultProps}
        currentPlayerCount={3}
        minPlayers={2}
      />
    );

    expect(screen.getByText(/3 \/ 2/)).toBeInTheDocument();
  });

  it("should show waiting message when not enough players", () => {
    render(
      <HostStartButton
        {...defaultProps}
        currentPlayerCount={1}
        minPlayers={3}
      />
    );

    expect(
      screen.getByText(/need 2 more players to start/i)
    ).toBeInTheDocument();
  });

  it("should show singular 'player' when only 1 player needed", () => {
    render(
      <HostStartButton
        {...defaultProps}
        currentPlayerCount={2}
        minPlayers={3}
      />
    );

    expect(
      screen.getByText(/need 1 more player to start/i)
    ).toBeInTheDocument();
  });

  it("should update player count on real-time event", async () => {
    let joinCallback: () => void = () => {};
    mockBind.mockImplementation((event, callback) => {
      if (event === "player:joined") {
        joinCallback = callback;
      }
    });

    render(
      <HostStartButton
        {...defaultProps}
        currentPlayerCount={1}
        minPlayers={3}
      />
    );

    expect(
      screen.getByText(/need 2 more players to start/i)
    ).toBeInTheDocument();

    // Simulate player join
    act(() => {
      joinCallback();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/need 1 more player to start/i)
      ).toBeInTheDocument();
    });
  });

  it("should show loading state when submitting", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({ data: { gameId: "game-123" } }),
              }),
            100
          )
        )
    );

    render(<HostStartButton {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: /start game/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/starting/i)).toBeInTheDocument();
    });
  });

  it("should call API when clicked", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { gameId: "game-123" } }),
    });

    render(<HostStartButton {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: /start game/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/games/game-123/start",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("should display error message on API failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ error: "Minimum players not met" }),
    });

    render(<HostStartButton {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: /start game/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/minimum players not met/i)
      ).toBeInTheDocument();
    });
  });
});
