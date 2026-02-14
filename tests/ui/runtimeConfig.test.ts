import { beforeEach, describe, expect, test } from "bun:test";

const loadRuntimeConfigModule = () => import(`../../src/ui/runtimeConfig.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  delete process.env.VITE_CONVEX_URL;
  delete process.env.VITE_CLERK_PUBLISHABLE_KEY;
  delete process.env.CONVEX_URL;
  delete process.env.CLERK_PUBLISHABLE_KEY;
});

describe("loadPublicRuntimeConfig", () => {
  test("returns validated config from VITE_* env vars", async () => {
    process.env.VITE_CONVEX_URL = "https://example.convex.cloud";
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_test_abc123";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();

    expect(loadPublicRuntimeConfig()).toEqual({
      convexUrl: "https://example.convex.cloud",
      clerkPublishableKey: "pk_test_abc123",
    });
  });

  test("falls back to legacy CONVEX_URL and CLERK_PUBLISHABLE_KEY", async () => {
    process.env.CONVEX_URL = "https://legacy.convex.cloud";
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_legacy";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();

    expect(loadPublicRuntimeConfig()).toEqual({
      convexUrl: "https://legacy.convex.cloud",
      clerkPublishableKey: "pk_test_legacy",
    });
  });

  test("throws when VITE_CONVEX_URL is missing", async () => {
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_test_abc123";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();
    expect(() => loadPublicRuntimeConfig()).toThrow("__NEEDS_SERVER_CONFIG__");
  });

  test("throws when VITE_CONVEX_URL is not https", async () => {
    process.env.VITE_CONVEX_URL = "http://example.convex.cloud";
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_test_abc123";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();
    expect(() => loadPublicRuntimeConfig()).toThrow("VITE_CONVEX_URL must use https");
  });

  test("throws generic error when VITE_CONVEX_URL is invalid", async () => {
    process.env.VITE_CONVEX_URL = "not-a-url";
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "pk_test_abc123";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();
    expect(() => loadPublicRuntimeConfig()).toThrow("VITE_CONVEX_URL must be a valid https URL");
  });

  test("throws when VITE_CLERK_PUBLISHABLE_KEY does not start with pk_", async () => {
    process.env.VITE_CONVEX_URL = "https://example.convex.cloud";
    process.env.VITE_CLERK_PUBLISHABLE_KEY = "sk_test_abc123";
    const { loadPublicRuntimeConfig } = await loadRuntimeConfigModule();
    expect(() => loadPublicRuntimeConfig()).toThrow("VITE_CLERK_PUBLISHABLE_KEY must start with pk_");
  });
});
