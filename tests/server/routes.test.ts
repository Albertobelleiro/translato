import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { DeepLError } from "../../src/translator/types";

let getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
let getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));

const loadRoutes = () => import(`../../src/server/routes.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  mock.restore();
  getLanguagesMock = mock(async () => [{ language: "DE", name: "German" }]);
  getUsageMock = mock(async () => ({ character_count: 1, character_limit: 500000 }));
  delete process.env.CONVEX_URL;
  delete process.env.CLERK_PUBLISHABLE_KEY;
  delete process.env.VITE_CLERK_PUBLISHABLE_KEY;
  delete process.env.INTERNAL_ALLOWED_EMAILS;
  delete process.env.INTERNAL_ALLOWED_DOMAINS;
  spyOn(Bun, "file").mockReturnValue({ text: async () => "" } as never);
  mock.module("../../src/translator/translate.ts", () => ({
    getLanguages: getLanguagesMock,
    getUsage: getUsageMock,
  }));
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
  test("returns 200 with runtime config values", async () => {
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

  test("returns 500 when CONVEX_URL is missing", async () => {
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_example";
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Missing CONVEX_URL" });
  });

  test("returns 500 when allowlist is missing", async () => {
    process.env.CONVEX_URL = "https://example.convex.cloud";
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_example";
    const { handleConfig } = await loadRoutes();
    const res = await handleConfig();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Missing INTERNAL_ALLOWED_EMAILS or INTERNAL_ALLOWED_DOMAINS" });
  });
});
