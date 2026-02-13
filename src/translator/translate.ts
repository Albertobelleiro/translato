import {
  DeepLError,
  type DeepLLanguage,
  type DeepLTranslateBody,
  type DeepLTranslateResult,
  type DeepLUsage,
  type PlainLanguage,
  type TranslateResponse,
} from "./types.ts";

const BASE_URL = "https://api-free.deepl.com/v2";

function getDeepLAuthToken(): string {
  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) {
    throw new Error("DEEPL_API_KEY is not configured");
  }
  return `DeepL-Auth-Key ${key}`;
}

const authToken = getDeepLAuthToken();
const authGetHeader = { Authorization: authToken };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: DeepLLanguage[];
  timestamp: number;
}

const languageCache: Partial<Record<"source" | "target", CacheEntry>> = {};

/** Hardcoded fallback languages (plain {code, name}) for when DeepL is unreachable */
const FALLBACK_LANGUAGES: PlainLanguage[] = [
  { code: "AR", name: "Arabic" },
  { code: "BG", name: "Bulgarian" },
  { code: "CS", name: "Czech" },
  { code: "DA", name: "Danish" },
  { code: "DE", name: "German" },
  { code: "EL", name: "Greek" },
  { code: "EN", name: "English" },
  { code: "ES", name: "Spanish" },
  { code: "ET", name: "Estonian" },
  { code: "FI", name: "Finnish" },
  { code: "FR", name: "French" },
  { code: "HU", name: "Hungarian" },
  { code: "ID", name: "Indonesian" },
  { code: "IT", name: "Italian" },
  { code: "JA", name: "Japanese" },
  { code: "KO", name: "Korean" },
  { code: "LT", name: "Lithuanian" },
  { code: "LV", name: "Latvian" },
  { code: "NB", name: "Norwegian" },
  { code: "NL", name: "Dutch" },
  { code: "PL", name: "Polish" },
  { code: "PT", name: "Portuguese" },
  { code: "RO", name: "Romanian" },
  { code: "RU", name: "Russian" },
  { code: "SK", name: "Slovak" },
  { code: "SL", name: "Slovenian" },
  { code: "SV", name: "Swedish" },
  { code: "TR", name: "Turkish" },
  { code: "UK", name: "Ukrainian" },
  { code: "ZH", name: "Chinese" },
];

function mapDeepLError(status: number): string {
  if (status === 403) return "Invalid API key";
  if (status === 429) return "Rate limit exceeded";
  if (status === 456) return "Translation quota exceeded";
  if (status >= 500) return "Translation service unavailable";
  return "Translation request failed";
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new DeepLError(res.status, mapDeepLError(res.status));
  return (await res.json()) as T;
}

export async function getLanguages(
  type: "source" | "target",
): Promise<DeepLLanguage[]> {
  const cached = languageCache[type];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  try {
    const res = await fetch(`${BASE_URL}/languages?type=${type}`, {
      headers: authGetHeader,
      signal: AbortSignal.timeout(5000),
    });
    const data = await parseResponse<DeepLLanguage[]>(res);
    languageCache[type] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    if (error instanceof DeepLError) throw error;
    if (error instanceof Error && error.name === "TimeoutError")
      throw new DeepLError(504, "Translation service unavailable");
    throw new DeepLError(502, "Translation service unavailable");
  }
}

export function getFallbackLanguages(): PlainLanguage[] {
  return FALLBACK_LANGUAGES;
}

export async function getUsage(): Promise<DeepLUsage> {
  try {
    const res = await fetch(`${BASE_URL}/usage`, {
      headers: authGetHeader,
      signal: AbortSignal.timeout(5000),
    });
    return await parseResponse<DeepLUsage>(res);
  } catch (error) {
    if (error instanceof DeepLError) throw error;
    if (error instanceof Error && error.name === "TimeoutError")
      throw new DeepLError(504, "Translation service unavailable");
    throw new DeepLError(502, "Translation service unavailable");
  }
}

export async function translate(
  text: string,
  targetLang: string,
  sourceLang?: string,
): Promise<TranslateResponse> {
  const body: DeepLTranslateBody = {
    text: [text],
    target_lang: targetLang,
    model_type: "latency_optimized",
  };
  if (sourceLang) body.source_lang = sourceLang;

  try {
    const res = await fetch(`${BASE_URL}/translate`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await parseResponse<DeepLTranslateResult>(res);
    if (!Array.isArray(data.translations) || data.translations.length === 0) {
      throw new DeepLError(502, "Translation service returned an empty result");
    }
    const t = data.translations[0];
    if (!t) {
      throw new DeepLError(502, "Translation service returned an empty result");
    }
    return {
      translatedText: t.text,
      detectedSourceLang: t.detected_source_language,
    };
  } catch (error) {
    if (error instanceof DeepLError) throw error;
    if (error instanceof Error && error.name === "TimeoutError")
      throw new DeepLError(504, "Translation service unavailable");
    throw new DeepLError(502, "Translation service unavailable");
  }
}
