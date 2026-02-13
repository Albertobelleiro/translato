import { describe, expect, test } from "bun:test";
import { languages, sourceLangs } from "../../src/translator/languages";

describe("languages", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
  });

  test("every entry has code, name, and Flag", () => {
    for (const lang of languages) {
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.name).toBe("string");
      expect(typeof lang.Flag).toBe("function");
    }
  });

  test("contains no duplicate codes", () => {
    expect(new Set(languages.map((l) => l.code)).size).toBe(languages.length);
  });

  test("includes key languages", () => {
    for (const code of ["EN-US", "EN-GB", "ES", "DE", "FR", "JA", "ZH-HANS"]) {
      expect(languages.some((l) => l.code === code)).toBe(true);
    }
  });
});

describe("sourceLangs", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(sourceLangs)).toBe(true);
    expect(sourceLangs.length).toBeGreaterThan(0);
  });

  test("every entry has code, name, and Flag", () => {
    for (const lang of sourceLangs) {
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.name).toBe("string");
      expect(typeof lang.Flag).toBe("function");
    }
  });

  test("contains no duplicate codes", () => {
    expect(new Set(sourceLangs.map((l) => l.code)).size).toBe(sourceLangs.length);
  });

  test("uses base codes without variants", () => {
    expect(sourceLangs.some((l) => l.code === "EN")).toBe(true);
    expect(sourceLangs.some((l) => l.code === "PT")).toBe(true);
    expect(sourceLangs.some((l) => l.code === "EN-US")).toBe(false);
    expect(sourceLangs.some((l) => l.code === "PT-BR")).toBe(false);
  });
});
