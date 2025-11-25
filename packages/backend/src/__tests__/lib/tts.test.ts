import { generateTTSUrl, isValidAudioUrl } from "../../lib/tts";

describe("TTS Library", () => {
  describe("generateTTSUrl", () => {
    it("should generate a valid TTS URL for English", () => {
      const url = generateTTSUrl("hello", "en-US");

      expect(url).toContain("translate.google.com");
      expect(url).toContain("tl=en-US");
      expect(url).toContain("q=hello");
    });

    it("should handle special characters in text", () => {
      const url = generateTTSUrl("hello world!", "en-US");

      expect(url).toContain("translate.google.com");
      expect(url).toContain(encodeURIComponent("hello world!"));
    });

    it("should use default language en-US if not specified", () => {
      const url = generateTTSUrl("hello");

      expect(url).toContain("tl=en-US");
    });

    it("should support different languages", () => {
      const url = generateTTSUrl("xin chào", "vi");

      expect(url).toContain("tl=vi");
      expect(url).toContain(encodeURIComponent("xin chào"));
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

