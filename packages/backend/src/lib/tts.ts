/**
 * Text-to-Speech Integration
 * Generate TTS URL with fallback options
 */

/**
 * Generate TTS URL for a text with multiple fallback options
 * @param text - Text to be spoken
 * @param lang - Language code (default: en-US)
 * @returns URL for audio file or null if should use Web Speech API
 */
export const generateTTSUrl = (text: string, lang: string = "en-US"): string | null => {
  // Prioritize Web Speech API (browser native) over external APIs
  // Return null to indicate that Web Speech API should be used
  // This avoids the 404 errors from Google's restricted TTS endpoint
  
  // For legacy compatibility, keep the URL generation but mark it as unreliable
  // Commented out the Google TTS URL due to 404 errors:
  // const encodedText = encodeURIComponent(text);
  // return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodedText}`;
  
  return null; // Use Web Speech API instead
};

/**
 * Validate pronunciation URL
 * @param url - URL cần validate
 * @returns true nếu URL hợp lệ
 */
export const isValidAudioUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

