import { test, expect, describe } from "bun:test";
import { languages, sourceLangs, type Language } from "./languages.ts";

describe("languages", () => {
  test("exports an array of languages", () => {
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
  });

  test("all languages have required properties", () => {
    languages.forEach((lang) => {
      expect(lang).toHaveProperty("code");
      expect(lang).toHaveProperty("name");
      expect(lang).toHaveProperty("Flag");
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.name).toBe("string");
      expect(typeof lang.Flag).toBe("function");
    });
  });

  test("all language codes are non-empty strings", () => {
    languages.forEach((lang) => {
      expect(lang.code.length).toBeGreaterThan(0);
    });
  });

  test("all language names are non-empty strings", () => {
    languages.forEach((lang) => {
      expect(lang.name.length).toBeGreaterThan(0);
    });
  });

  test("language codes are unique", () => {
    const codes = languages.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  test("contains expected languages", () => {
    const codes = languages.map((l) => l.code);
    expect(codes).toContain("EN-US");
    expect(codes).toContain("EN-GB");
    expect(codes).toContain("ES");
    expect(codes).toContain("FR");
    expect(codes).toContain("DE");
    expect(codes).toContain("JA");
    expect(codes).toContain("ZH-HANS");
    expect(codes).toContain("ZH-HANT");
  });

  test("contains both Portuguese variants", () => {
    const codes = languages.map((l) => l.code);
    expect(codes).toContain("PT-BR");
    expect(codes).toContain("PT-PT");
  });

  test("contains both Spanish variants", () => {
    const codes = languages.map((l) => l.code);
    expect(codes).toContain("ES");
    expect(codes).toContain("ES-419");
  });

  test("language names match expected format", () => {
    const spanish = languages.find((l) => l.code === "ES");
    expect(spanish?.name).toBe("Spanish");

    const spanishLatam = languages.find((l) => l.code === "ES-419");
    expect(spanishLatam?.name).toBe("Spanish (LatAm)");

    const englishUS = languages.find((l) => l.code === "EN-US");
    expect(englishUS?.name).toBe("English (US)");
  });
});

describe("sourceLangs", () => {
  test("exports an array of source languages", () => {
    expect(Array.isArray(sourceLangs)).toBe(true);
    expect(sourceLangs.length).toBeGreaterThan(0);
  });

  test("all source languages have required properties", () => {
    sourceLangs.forEach((lang) => {
      expect(lang).toHaveProperty("code");
      expect(lang).toHaveProperty("name");
      expect(lang).toHaveProperty("Flag");
    });
  });

  test("source language codes are unique", () => {
    const codes = sourceLangs.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  test("contains simpler language codes than target languages", () => {
    const sourceCodes = sourceLangs.map((l) => l.code);
    expect(sourceCodes).toContain("EN");
    expect(sourceCodes).not.toContain("EN-US");
    expect(sourceCodes).not.toContain("EN-GB");
  });

  test("has PT but not PT-BR or PT-PT", () => {
    const sourceCodes = sourceLangs.map((l) => l.code);
    expect(sourceCodes).toContain("PT");
    expect(sourceCodes).not.toContain("PT-BR");
    expect(sourceCodes).not.toContain("PT-PT");
  });

  test("has ES but not ES-419", () => {
    const sourceCodes = sourceLangs.map((l) => l.code);
    expect(sourceCodes).toContain("ES");
    expect(sourceCodes).not.toContain("ES-419");
  });

  test("has ZH but not ZH-HANS or ZH-HANT", () => {
    const sourceCodes = sourceLangs.map((l) => l.code);
    expect(sourceCodes).toContain("ZH");
    expect(sourceCodes).not.toContain("ZH-HANS");
    expect(sourceCodes).not.toContain("ZH-HANT");
  });

  test("source languages are a subset of target languages (by base code)", () => {
    const targetCodes = languages.map((l) => l.code);
    sourceLangs.forEach((source) => {
      const hasMatchInTarget = targetCodes.some((target) =>
        target === source.code || target.startsWith(source.code + "-")
      );
      expect(hasMatchInTarget).toBe(true);
    });
  });
});

describe("Language type", () => {
  test("matches expected interface structure", () => {
    const testLang: Language = languages[0]!;
    expect(testLang).toBeDefined();
    expect(typeof testLang.code).toBe("string");
    expect(typeof testLang.name).toBe("string");
    expect(typeof testLang.Flag).toBe("function");
  });
});

describe("edge cases and data integrity", () => {
  test("no language has empty code or name", () => {
    [...languages, ...sourceLangs].forEach((lang) => {
      expect(lang.code.trim()).toBe(lang.code);
      expect(lang.code).not.toBe("");
      expect(lang.name.trim()).toBe(lang.name);
      expect(lang.name).not.toBe("");
    });
  });

  test("languages array has expected size range", () => {
    expect(languages.length).toBeGreaterThanOrEqual(30);
    expect(languages.length).toBeLessThanOrEqual(50);
  });

  test("sourceLangs array has expected size range", () => {
    expect(sourceLangs.length).toBeGreaterThanOrEqual(25);
    expect(sourceLangs.length).toBeLessThanOrEqual(40);
  });

  test("no duplicate language names", () => {
    const names = languages.map((l) => l.name);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);
  });

  test("all codes are uppercase or contain hyphen with uppercase", () => {
    [...languages, ...sourceLangs].forEach((lang) => {
      expect(lang.code).toMatch(/^[A-Z]+(-[A-Z0-9]+)?$/);
    });
  });
});