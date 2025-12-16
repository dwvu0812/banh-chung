/**
 * Text-to-Speech Utility
 * Uses Web Speech API with fallback options
 */

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Play text using Web Speech API
 * @param text - Text to speak
 * @param options - Speech synthesis options
 * @returns Promise that resolves when speech ends or rejects on error
 */
export const speakText = (
  text: string,
  options: TTSOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Web Speech API is supported
    if (!("speechSynthesis" in window)) {
      reject(new Error("Web Speech API not supported in this browser"));
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set options with defaults
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Set up event listeners
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS Error:", error);
      reject(error);
    }
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = (): void => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if TTS is supported in the current browser
 */
export const isTTSSupported = (): boolean => {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
};

/**
 * Get available voices for a specific language
 * @param lang - Language code (e.g., 'en-US')
 * @returns Array of available voices
 */
export const getVoicesForLanguage = (lang: string): SpeechSynthesisVoice[] => {
  if (!isTTSSupported()) return [];

  const voices = window.speechSynthesis.getVoices();
  return voices.filter((voice) => voice.lang.startsWith(lang.split("-")[0]));
};

/**
 * Ensure voices are loaded (some browsers need this)
 */
export const ensureVoicesLoaded = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    const handleVoicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );
        resolve(loadedVoices);
      }
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged
    );

    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged
      );
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
};

/**
 * Legacy audio URL handler (for backward compatibility)
 * Now always returns null since we use Web Speech API
 */
export const playAudioFromUrl = async (url: string | null): Promise<void> => {
  if (!url) {
    throw new Error("No audio URL provided - use speakText instead");
  }

  // Attempt to play from URL but handle failures gracefully
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.addEventListener("ended", () => resolve());
    audio.addEventListener("error", (e) => {
      console.warn("Audio URL failed, falling back to Web Speech API:", e);
      reject(new Error("Audio URL failed to load"));
    });

    audio.play().catch((error) => {
      console.warn("Audio playback failed:", error);
      reject(error);
    });
  });
};
