import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { mapDeepLError } from "../../convex/lib/errors";
import schema from "../../convex/schema";

const translateActionRef = makeFunctionReference<"action">("translator:translate");
const getTodayQueryRef = makeFunctionReference<"query">("stats:getToday");

const convexModules = {
  "convex/_generated/api.js": () => import("../../convex/_generated/api.js"),
  "convex/stats.ts": () => import("../../convex/stats.ts"),
  "convex/translator.ts": () => import("../../convex/translator.ts"),
};

function createTestConvex() {
  return convexTest(schema, convexModules);
}

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
    const t = createTestConvex();
    const fetchSpy = spyOn(globalThis, "fetch");

    await expect(t.action(translateActionRef, {
      text: "Hello",
      targetLang: "ES",
    })).rejects.toThrow("Not authenticated");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("calls DeepL and records usage for allowed users", async () => {
    const t = createTestConvex().withIdentity({
      tokenIdentifier: "user|allowed",
      email: "me@example.com",
    });
    const fetchSpy = spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({
      translations: [{ text: "Hola", detected_source_language: "EN" }],
    }), { status: 200 }));

    await expect(t.action(translateActionRef, {
      text: "Hello",
      targetLang: "ES",
    })).resolves.toEqual({ translatedText: "Hola", detectedSourceLang: "EN" });

    const usage = await t.query(getTodayQueryRef);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(usage).toMatchObject({
      userId: "user|allowed",
      translationCount: 1,
      characterCount: 5,
    });
  });

  test("throttles burst requests per user", async () => {
    const t = createTestConvex().withIdentity({
      tokenIdentifier: "user|throttle",
      email: "me@example.com",
    });
    const fetchSpy = spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((async () => new Response(JSON.stringify({
      translations: [{ text: "Hola", detected_source_language: "EN" }],
    }), { status: 200 })) as never);

    for (let i = 0; i < 20; i += 1) {
      await expect(t.action(translateActionRef, { text: `Hello ${i}`, targetLang: "ES" })).resolves.toEqual({
        translatedText: "Hola",
        detectedSourceLang: "EN",
      });
    }

    const usage = await t.query(getTodayQueryRef);
    await expect(t.action(translateActionRef, { text: "Hello 21", targetLang: "ES" })).rejects.toThrow("Rate limit exceeded");

    expect(fetchSpy).toHaveBeenCalledTimes(20);
    expect(usage).toMatchObject({
      userId: "user|throttle",
      translationCount: 20,
      characterCount: 150,
    });
  });
});
