import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { DeepLError } from "../../src/translator/types";

const mockDeepLTranslation = (text: string, detectedLang = "EN") => ({ translations: [{ detected_source_language: detectedLang, text }] });
const mockDeepLLanguages = () => [{ language: "DE", name: "German", supports_formality: true }, { language: "ES", name: "Spanish", supports_formality: true }];
const mockDeepLUsage = () => ({ character_count: 12345, character_limit: 500000 });

let fetchSpy: ReturnType<typeof spyOn>;
const loadModule = () => import(`../../src/translator/translate.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  mock.restore();
  process.env.DEEPL_API_KEY = "test-key";
  fetchSpy = spyOn(globalThis, "fetch");
});

describe("translate()", () => {
  test("sends correct request and maps translation response", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLTranslation("Hola mundo")), { status: 200 }));
    const { translate } = await loadModule();
    await expect(translate("Hello world", "ES", "EN")).resolves.toEqual({ translatedText: "Hola mundo", detectedSourceLang: "EN" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api-free.deepl.com/v2/translate");
    expect((init.headers as Record<string, string>).Authorization).toBe("DeepL-Auth-Key test-key");
    expect(JSON.parse(init.body as string)).toEqual({ text: ["Hello world"], target_lang: "ES", source_lang: "EN", model_type: "latency_optimized" });
  });

  test("omits source_lang when not provided", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLTranslation("Hola")), { status: 200 }));
    const { translate } = await loadModule();
    await translate("Hello", "ES");
    expect(JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string)).toEqual({ text: ["Hello"], target_lang: "ES", model_type: "latency_optimized" });
  });

  test("maps DeepL HTTP errors to DeepLError", async () => {
    const { translate } = await loadModule();
    for (const status of [403, 429, 456, 503]) {
      fetchSpy.mockResolvedValueOnce(new Response("{}", { status }));
      await expect(translate("Hello", "ES")).rejects.toBeInstanceOf(DeepLError);
      await expect(translate("Hello", "ES")).rejects.toMatchObject({ status });
    }
  });

  test("throws DeepLError on timeout", async () => {
    fetchSpy.mockRejectedValue(Object.assign(new Error("timeout"), { name: "TimeoutError" }));
    const { translate } = await loadModule();
    await expect(translate("Hello", "ES")).rejects.toMatchObject({ status: 504 });
  });
});

describe("getLanguages()", () => {
  test("fetches from languages endpoint and returns array", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLLanguages()), { status: 200 }));
    const { getLanguages } = await loadModule();
    await expect(getLanguages("target")).resolves.toEqual(mockDeepLLanguages());
    expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://api-free.deepl.com/v2/languages?type=target");
  });

  test("caches repeated calls for same type", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLLanguages()), { status: 200 }));
    const { getLanguages } = await loadModule();
    await getLanguages("source");
    await getLanguages("source");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("throws DeepLError on API failure", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 500 }));
    const { getLanguages } = await loadModule();
    await expect(getLanguages("target")).rejects.toMatchObject({ status: 500 });
  });
});

describe("getUsage()", () => {
  test("fetches usage and returns usage payload", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLUsage()), { status: 200 }));
    const { getUsage } = await loadModule();
    await expect(getUsage()).resolves.toEqual(mockDeepLUsage());
    expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://api-free.deepl.com/v2/usage");
  });

  test("throws DeepLError on API failure", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 403 }));
    const { getUsage } = await loadModule();
    await expect(getUsage()).rejects.toMatchObject({ status: 403 });
  });
});
