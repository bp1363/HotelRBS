/**
 * Translation Service
 * Uses LibreTranslate API (free, no API key required)
 * Alternative: Can be switched to Google Translate, MyMemory, etc.
 */

const LIBRETRANSLATE_API = "https://libretranslate.com/translate";
// Alternative APIs (uncomment to use):
// const MYMEMORY_API = "https://api.mymemory.translated.net/get";
// const GOOGLE_TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";

interface TranslationCache {
  [key: string]: string;
}

// Cache translations to avoid redundant API calls
const translationCache: TranslationCache = {};

/**
 * Translate text using LibreTranslate API
 * @param text - Text to translate
 * @param targetLang - Target language code (e.g., 'ar', 'en', 'fr')
 * @param sourceLang - Source language code (default: 'en')
 * @returns Translated text
 */
export async function translateText(
  text: string,
  targetLang: string = "en",
  sourceLang: string = "en"
): Promise<string> {
  // Return original text if target is same as source
  if (targetLang === sourceLang || !text.trim()) {
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLang}_${targetLang}_${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Using LibreTranslate (free, no API key)
    const response = await fetch(LIBRETRANSLATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || text;

    // Cache the translation
    translationCache[cacheKey] = translatedText;

    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text on error
    return text;
  }
}

/**
 * Translate multiple texts in batch
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code
 * @returns Array of translated texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: string = "en",
  sourceLang: string = "en"
): Promise<string[]> {
  // Translate in parallel (with rate limiting consideration)
  const translations = await Promise.all(
    texts.map((text) => translateText(text, targetLang, sourceLang))
  );
  return translations;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach((key) => delete translationCache[key]);
}

/**
 * Alternative: MyMemory Translation API (free tier: 10,000 words/day)
 * Uncomment and use this if LibreTranslate doesn't work
 */
const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export async function translateWithMyMemory(
  text: string,
  targetLang: string = "en",
  sourceLang: string = "en"
): Promise<string> {
  if (targetLang === sourceLang || !text.trim()) {
    return text;
  }

  const cacheKey = `mymemory_${sourceLang}_${targetLang}_${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.responseData?.translatedText || text;

    translationCache[cacheKey] = translatedText;
    return translatedText;
  } catch (error) {
    console.error("MyMemory translation error:", error);
    return text;
  }
}

