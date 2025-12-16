import { generateTTSUrl, isValidAudioUrl } from "../../lib/tts";

describe("TTS Library", () => {
  describe("generateTTSUrl", () => {
    it("should return null to indicate Web Speech API should be used", () => {
      const url = generateTTSUrl("hello", "en-US");
      expect(url).toBeNull();
    });

    it("should return null for any text input", () => {
      const url = generateTTSUrl("hello world!", "en-US");
      expect(url).toBeNull();
    });

    it("should return null regardless of language", () => {
      const url = generateTTSUrl("hello");
      expect(url).toBeNull();
    });

    it("should return null for different languages", () => {
      const url = generateTTSUrl("xin chào", "vi");
      expect(url).toBeNull();
    });
  });

  describe("isValidAudioUrl", () => {
    it("should return true for valid HTTP URL", () => {
      expect(isValidAudioUrl("http://example.com/audio.mp3")).toBe(true);
    });

    it("should return true for valid HTTPS URL", () => {
      expect(isValidAudioUrl("https://example.com/audio.mp3")).toBe(true);
    });

    it("should return false for invalid URL", () => {
      expect(isValidAudioUrl("not-a-url")).toBe(false);
    });

    it("should return false for other protocols", () => {
      expect(isValidAudioUrl("ftp://example.com/audio.mp3")).toBe(false);
    });
  });
});

