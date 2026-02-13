import { describe, expect, test } from "bun:test";
import { mapDeepLError } from "../../convex/lib/errors";

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
