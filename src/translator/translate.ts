import {
  DeepLError,
  type DeepLLanguage,
  type DeepLUsage,
} from "./types.ts";
const BASE_URL = "https://api-free.deepl.com/v2";
const authToken = `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`;
const authGetHeader = { Authorization: authToken };
const languageCache: Partial<Record<"source" | "target", DeepLLanguage[]>> = {};
function mapDeepLError(status: number): string {
  if (status === 403) return "Invalid API key";
  if (status === 429) return "Rate limit exceeded";
  if (status === 456) return "Translation quota exceeded";
  if (status >= 500) return "Translation service unavailable";
  return "Translation request failed";
}
async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new DeepLError(res.status, mapDeepLError(res.status));
  return await res.json() as T;
}
export async function getLanguages(type: "source" | "target"): Promise<DeepLLanguage[]> {
  if (languageCache[type]) return languageCache[type]!;
  try {
    const res = await fetch(`${BASE_URL}/languages?type=${type}`, { headers: authGetHeader, signal: AbortSignal.timeout(5000) });
    const data = await parseResponse<DeepLLanguage[]>(res);
    languageCache[type] = data;
    return data;
  } catch (error) {
    if (error instanceof DeepLError) throw error;
    if (error instanceof Error && error.name === "TimeoutError") throw new DeepLError(504, "Translation service unavailable");
    throw new DeepLError(502, "Translation service unavailable");
  }
}
export async function getUsage(): Promise<DeepLUsage> {
  try {
    const res = await fetch(`${BASE_URL}/usage`, { headers: authGetHeader, signal: AbortSignal.timeout(5000) });
    return await parseResponse<DeepLUsage>(res);
  } catch (error) {
    if (error instanceof DeepLError) throw error;
    if (error instanceof Error && error.name === "TimeoutError") throw new DeepLError(504, "Translation service unavailable");
    throw new DeepLError(502, "Translation service unavailable");
  }
}
