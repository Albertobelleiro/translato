import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { DeepLError } from "../../src/translator/types";

const mockDeepLLanguages = () => [{ language: "DE", name: "German", supports_formality: true }, { language: "ES", name: "Spanish", supports_formality: true }];
const mockDeepLUsage = () => ({ character_count: 12345, character_limit: 500000 });

let fetchSpy: ReturnType<typeof spyOn>;
const loadModule = () => import(`../../src/translator/translate.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  mock.restore();
  process.env.DEEPL_API_KEY = "test-key";
  fetchSpy = spyOn(globalThis, "fetch");
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

  test("sends auth header", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(mockDeepLUsage()), { status: 200 }));
    const { getUsage } = await loadModule();
    await getUsage();
    const headers = (fetchSpy.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("DeepL-Auth-Key test-key");
  });
});
