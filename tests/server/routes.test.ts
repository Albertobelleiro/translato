import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { MAX_TEXT_BYTES } from "../../src/shared/constants.ts";
import { DeepLError } from "../../src/translator/types";

let getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
let getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));
let translateMock = mock(async () => ({ translatedText: "Hola", detectedSourceLang: "EN" }));
let getFallbackLanguagesMock = mock(() => [{ code: "EN", name: "English" }]);

const loadRoutes = () => import(`../../src/server/routes.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  mock.restore();
  getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
  getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));
  translateMock = mock(async () => ({ translatedText: "Hola", detectedSourceLang: "EN" }));
  getFallbackLanguagesMock = mock(() => [{ code: "EN", name: "English" }]);
  delete process.env.CONVEX_URL;
  delete process.env.CLERK_PUBLISHABLE_KEY;
  delete process.env.VITE_CLERK_PUBLISHABLE_KEY;
  spyOn(Bun, "file").mockReturnValue({ text: async () => "" } as never);
  mock.module("../../src/translator/translate.ts", () => ({
    getLanguages: getLanguagesMock,
    getUsage: getUsageMock,
    translate: translateMock,
    getFallbackLanguages: getFallbackLanguagesMock,
  }));
});

describe("handleOptions", () => {
  test("returns 204 with CORS headers", async () => {
    const { handleOptions } = await loadRoutes();
    const res = handleOptions();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  });
});

describe("CORS headers", () => {
  test("JSON responses include CORS headers", async () => {
    const { handleUsage } = await loadRoutes();
    const res = await handleUsage();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

describe("handleTranslate", () => {
  test("returns 200 with translated text", async () => {
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", target_lang: "ES" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translatedText: "Hola", detectedSourceLang: "EN" });
    expect(translateMock).toHaveBeenCalledWith("Hello", "ES", undefined);
  });

  test("returns 400 when text is empty", async () => {
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "", target_lang: "ES" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 when target_lang is missing", async () => {
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 when text exceeds 128KB", async () => {
    const { handleTranslate } = await loadRoutes();
    const bigText = "a".repeat(MAX_TEXT_BYTES + 1);
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: bigText, target_lang: "ES" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 for malformed JSON body", async () => {
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{\"text\":",
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Malformed JSON body" });
  });

  test("maps DeepL 403 to 401", async () => {
    translateMock.mockRejectedValue(new DeepLError(403, "Invalid API key"));
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", target_lang: "ES" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(401);
  });

  test("maps DeepL 456 to 429", async () => {
    translateMock.mockRejectedValue(new DeepLError(456, "Translation quota exceeded"));
    const { handleTranslate } = await loadRoutes();
    const req = new Request("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", target_lang: "ES" }),
    });
    const res = await handleTranslate(req);
    expect(res.status).toBe(429);
  });
});

describe("handleLanguages", () => {
  test("returns 200 with source and target arrays", async () => {
    const { handleLanguages } = await loadRoutes();
    const res = await handleLanguages();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toEqual([{ code: "DE", name: "German" }]);
    expect(data.target).toEqual([{ code: "DE", name: "German" }]);
    expect(getLanguagesMock).toHaveBeenCalledWith("source");
    expect(getLanguagesMock).toHaveBeenCalledWith("target");
  });

  test("returns fallback languages when DeepL fails", async () => {
    getLanguagesMock.mockRejectedValue(new DeepLError(502, "Translation service unavailable"));
    const { handleLanguages } = await loadRoutes();
    const res = await handleLanguages();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toEqual([{ code: "EN", name: "English" }]);
    expect(data.target).toEqual([{ code: "EN", name: "English" }]);
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
  test("returns 200 with runtime config values", async () => {
    process.env.CONVEX_URL = "https://example.convex.cloud";
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_example";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      convexUrl: "https://example.convex.cloud",
      clerkPublishableKey: "pk_test_example",
    });
  });

  test("returns 500 when CONVEX_URL is missing", async () => {
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_example";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Missing CONVEX_URL" });
  });
});
