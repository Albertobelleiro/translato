import { beforeEach, describe, expect, mock, test } from "bun:test";
import { DeepLError } from "../../src/translator/types";

let translateMock = mock(async () => ({ translatedText: "Hola", detectedSourceLang: "EN" }));
let getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
let getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));

const loadRoutes = () => import(`../../src/server/routes.ts?test=${crypto.randomUUID()}`);

function mockRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mock.restore();
  translateMock = mock(async () => ({ translatedText: "Hola", detectedSourceLang: "EN" }));
  getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
  getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));
  delete process.env.CONVEX_URL;
  delete process.env.CLERK_PUBLISHABLE_KEY;
  delete process.env.VITE_CLERK_PUBLISHABLE_KEY;
  delete process.env.INTERNAL_ALLOWED_EMAILS;
  delete process.env.INTERNAL_ALLOWED_DOMAINS;
  mock.module("../../src/translator/translate.ts", () => ({
    translate: translateMock,
    getLanguages: getLanguagesMock,
    getUsage: getUsageMock,
  }));
});

describe("handleTranslate", () => {
  test("returns 200 and passes payload to translate()", async () => {
    const { handleTranslate } = await loadRoutes();
    const res = await handleTranslate(mockRequest({ text: "Hello", source_lang: "EN", target_lang: "ES" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translatedText: "Hola", detectedSourceLang: "EN" });
    expect(translateMock).toHaveBeenCalledWith("Hello", "ES", "EN");
  });

  test("returns 400 for empty, missing text, missing target_lang, and invalid JSON", async () => {
    const { handleTranslate } = await loadRoutes();
    expect((await handleTranslate(mockRequest({ text: "", target_lang: "ES" }))).status).toBe(400);
    expect((await handleTranslate(mockRequest({ target_lang: "ES" }))).status).toBe(400);
    expect((await handleTranslate(mockRequest({ text: "Hello" }))).status).toBe(400);
    const invalid = new Request("http://localhost:3000/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    expect((await handleTranslate(invalid)).status).toBe(400);
  });

  test("returns 400 when text exceeds 128 KiB", async () => {
    const { handleTranslate } = await loadRoutes();
    const tooLarge = "a".repeat(128 * 1024);
    expect((await handleTranslate(mockRequest({ text: tooLarge, target_lang: "ES" }))).status).toBe(400);
  });

  test("maps DeepLError status codes and handles unexpected errors", async () => {
    const { handleTranslate } = await loadRoutes();
    for (const status of [401, 429, 502]) {
      translateMock.mockRejectedValueOnce(new DeepLError(status, "bad"));
      expect((await handleTranslate(mockRequest({ text: "Hello", target_lang: "ES" }))).status).toBe(status);
    }
    translateMock.mockRejectedValueOnce(new Error("boom"));
    expect((await handleTranslate(mockRequest({ text: "Hello", target_lang: "ES" }))).status).toBe(500);
  });
});

describe("handleLanguages", () => {
  test("returns 200 with languages array", async () => {
    const { handleLanguages } = await loadRoutes();
    const res = await handleLanguages();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ languages: [{ language: "DE", name: "German" }] });
    expect(getLanguagesMock).toHaveBeenCalledWith("target");
  });

  test("returns 502 when getLanguages throws DeepLError(502)", async () => {
    getLanguagesMock.mockRejectedValue(new DeepLError(502, "Translation service unavailable"));
    const { handleLanguages } = await loadRoutes();
    expect((await handleLanguages()).status).toBe(502);
  });
});

describe("handleUsage", () => {
  test("returns 200 with usage payload", async () => {
    const { handleUsage } = await loadRoutes();
    const res = await handleUsage();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ character_count: 1, character_limit: 500000 });
  });

  test("returns 502 when getUsage throws DeepLError(502)", async () => {
    getUsageMock.mockRejectedValue(new DeepLError(502, "Translation service unavailable"));
    const { handleUsage } = await loadRoutes();
    expect((await handleUsage()).status).toBe(502);
  });
});

describe("handleConfig", () => {
  test("returns 200 with convex and clerk keys", async () => {
    process.env.CONVEX_URL = "https://example.convex.cloud";
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_example";
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      convexUrl: "https://example.convex.cloud",
      clerkPublishableKey: "pk_test_example",
      internalAllowedEmails: ["me@example.com"],
      internalAllowedDomains: [],
    });
  });

  test("falls back to VITE_CLERK_PUBLISHABLE_KEY", async () => {
    process.env.CONVEX_URL = "https://example.convex.cloud";
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_test_vite";
    process.env.INTERNAL_ALLOWED_DOMAINS = "example.com";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      convexUrl: "https://example.convex.cloud",
      clerkPublishableKey: "pk_test_vite",
      internalAllowedEmails: [],
      internalAllowedDomains: ["example.com"],
    });
  });
});
