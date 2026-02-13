import { describe, expect, test } from "bun:test";
import { todayIso } from "../../convex/lib/dates";

describe("todayIso", () => {
  test("returns YYYY-MM-DD format", () => {
    const value = todayIso();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("matches current UTC date", () => {
    expect(todayIso()).toBe(new Date().toISOString().slice(0, 10));
  });
});
