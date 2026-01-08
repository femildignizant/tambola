import { renderHook, act } from "@testing-library/react";
import { useNumberAnnouncer } from "./useNumberAnnouncer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("useNumberAnnouncer", () => {
  const mockSpeak = vi.fn();
  const mockCancel = vi.fn();
  const mockGetVoices = vi.fn().mockReturnValue([]);

  beforeEach(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        onvoiceschanged: null,
      },
      writable: true,
    });
    
    // Mock SpeechSynthesisUtterance
    class MockSpeechSynthesisUtterance {
      text = "";
      voice = null;
      rate = 1;
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      writable: true,
    });

    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with mute state from localStorage", () => {
    localStorage.setItem("tambola-mute-preference", "true");
    const { result } = renderHook(() => useNumberAnnouncer());
    expect(result.current.isMuted).toBe(true);
  });

  it("toggles mute state and persists to localStorage", () => {
    const { result } = renderHook(() => useNumberAnnouncer());
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
    expect(localStorage.getItem("tambola-mute-preference")).toBe("true");
    expect(mockCancel).toHaveBeenCalled();

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(localStorage.getItem("tambola-mute-preference")).toBe("false");
  });

  it("announces single digit numbers correctly", () => {
    const { result } = renderHook(() => useNumberAnnouncer());
    
    act(() => {
      result.current.announceNumber(5);
    });

    // Simulate voices loading after announceNumber sets the listener
    act(() => {
      if (window.speechSynthesis.onvoiceschanged) {
        // @ts-ignore
        window.speechSynthesis.onvoiceschanged();
      }
    });

    expect(mockSpeak).toHaveBeenCalledWith(expect.objectContaining({
      text: "5"
    }));
  });

  it("announces double digit numbers digit-by-digit then full", () => {
    const { result } = renderHook(() => useNumberAnnouncer());
    
    act(() => {
      result.current.announceNumber(42);
    });

    // Simulate voices loading after announceNumber sets the listener
    act(() => {
      if (window.speechSynthesis.onvoiceschanged) {
        // @ts-ignore
        window.speechSynthesis.onvoiceschanged();
      }
    });

    expect(mockSpeak).toHaveBeenCalledWith(expect.objectContaining({
      text: "4. 2. 42."
    }));
  });

  it("does not announce when muted", () => {
    const { result } = renderHook(() => useNumberAnnouncer());
    
    act(() => {
      result.current.toggleMute();
    });

    act(() => {
      result.current.announceNumber(42);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
