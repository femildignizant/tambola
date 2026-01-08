import { useState, useEffect, useCallback } from "react";

const MUTE_PREFERENCE_KEY = "tambola-mute-preference";

export function useNumberAnnouncer() {
  const [isMuted, setIsMuted] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
      const savedMute = localStorage.getItem(MUTE_PREFERENCE_KEY);
      if (savedMute !== null) {
        setIsMuted(JSON.parse(savedMute));
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem(MUTE_PREFERENCE_KEY, JSON.stringify(newValue));
      if (newValue) {
        window.speechSynthesis.cancel();
      }
      return newValue;
    });
  }, []);

  const announceNumber = useCallback(
    (number: number) => {
      if (isMuted || !supported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance();
      
      // Format: "Four. Two. Forty Two."
      let text = "";
      if (number < 10) {
        text = `${number}`;
      } else {
        const digits = number.toString().split("");
        text = `${digits[0]}. ${digits[1]}. ${number}.`;
      }
      
      utterance.text = text;
      utterance.rate = 0.9; // Slightly slower for clarity

      // Try to select an English female voice
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.includes("Female") || voice.name.includes("Samantha") || voice.name.includes("Google US English"))
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
          window.speechSynthesis.onvoiceschanged = null; // Cleanup
        };
      }
    },
    [isMuted, supported]
  );

  return {
    isMuted,
    toggleMute,
    announceNumber,
    supported,
  };
}
