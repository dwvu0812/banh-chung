/**
 * Google Text-to-Speech Integration
 * Tạo URL audio cho pronunciation
 */

/**
 * Generate Google TTS URL cho một từ
 * @param text - Từ cần phát âm
 * @param lang - Ngôn ngữ (mặc định: en-US)
 * @returns URL của file audio
 */
export const generateTTSUrl = (text: string, lang: string = "en-US"): string => {
  // Sử dụng Google Translate TTS API (không cần API key)
  // Format: https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=LANG&q=TEXT
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodedText}`;
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

