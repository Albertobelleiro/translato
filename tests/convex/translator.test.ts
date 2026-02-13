import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { mapDeepLError } from "../../convex/lib/errors";

const loadTranslatorModule = () => import(`../../convex/translator.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  mock.restore();
  process.env.DEEPL_API_KEY = "test-key";
  process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
  delete process.env.INTERNAL_ALLOWED_DOMAINS;
});

describe("mapDeepLError", () => {
  test("maps 403 to invalid API key", () => {
    expect(mapDeepLError(403)).toEqual({ status: 401, message: "Invalid API key" });
  });

  test("maps 429 to rate limit exceeded", () => {
    expect(mapDeepLError(429)).toEqual({ status: 429, message: "Rate limit exceeded" });
  });

  test("maps 456 to translation quota exceeded", () => {
    expect(mapDeepLError(456)).toEqual({ status: 429, message: "Translation quota exceeded" });
  });

  test("maps 500+ to translation service unavailable", () => {
    expect(mapDeepLError(503)).toEqual({ status: 502, message: "Translation service unavailable" });
  });

  test("maps unknown codes to generic failure", () => {
    expect(mapDeepLError(418)).toEqual({ status: 502, message: "Translation request failed" });
  });
});

describe("translate action auth enforcement", () => {
  test("rejects unauthenticated calls before contacting DeepL", async () => {
    const { translate } = await loadTranslatorModule();
    const fetchSpy = spyOn(globalThis, "fetch");

    const ctx = {
      auth: { getUserIdentity: async () => null },
      runMutation: mock(async () => null),
    } as never;

    await expect((translate as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler(ctx, {
      text: "Hello",
      targetLang: "ES",
    })).rejects.toThrow("Not authenticated");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("calls DeepL and records usage for allowed users", async () => {
    const { translate } = await loadTranslatorModule();
    const fetchSpy = spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({
      translations: [{ text: "Hola", detected_source_language: "EN" }],
    }), { status: 200 }));

    const runMutation = mock(async () => null);
    const ctx = {
      auth: { getUserIdentity: async () => ({ tokenIdentifier: "user|throttle", email: "me@example.com" }) },
      runMutation,
    } as never;

    await expect((translate as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler(ctx, {
      text: "Hello",
      targetLang: "ES",
    })).resolves.toEqual({ translatedText: "Hola", detectedSourceLang: "EN" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(runMutation).toHaveBeenCalledTimes(1);
  });

  test("throttles burst requests per user", async () => {
    const { translate } = await loadTranslatorModule();
    const fetchSpy = spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((async () => new Response(JSON.stringify({
      translations: [{ text: "Hola", detected_source_language: "EN" }],
    }), { status: 200 })) as never);

    const runMutation = mock(async () => null);
    const ctx = {
      auth: { getUserIdentity: async () => ({ tokenIdentifier: "user|1", email: "me@example.com" }) },
      runMutation,
    } as never;

    const handler = (translate as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler;
    for (let i = 0; i < 20; i += 1) {
      await expect(handler(ctx, { text: `Hello ${i}`, targetLang: "ES" })).resolves.toEqual({
        translatedText: "Hola",
        detectedSourceLang: "EN",
      });
    }

    await expect(handler(ctx, { text: "Hello 21", targetLang: "ES" })).rejects.toThrow("Rate limit exceeded");
  });
});
