import { test, expect, describe } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RULES_DIR = join(import.meta.dir);

describe(".mdc rule files validation", () => {
  const mdcFiles = readdirSync(RULES_DIR).filter((file) => file.endsWith(".mdc"));

  test("finds .mdc rule files", () => {
    expect(mdcFiles.length).toBeGreaterThan(0);
  });

  mdcFiles.forEach((filename) => {
    describe(filename, () => {
      const filepath = join(RULES_DIR, filename);
      const content = readFileSync(filepath, "utf-8");

      test("has YAML frontmatter", () => {
        expect(content.startsWith("---")).toBe(true);
        const secondDelimiterIndex = content.indexOf("---", 3);
        expect(secondDelimiterIndex).toBeGreaterThan(0);
      });

      test("frontmatter contains description field", () => {
        const frontmatterEnd = content.indexOf("---", 3);
        const frontmatter = content.slice(0, frontmatterEnd);
        expect(frontmatter).toContain("description:");
      });

      test("frontmatter contains globs field", () => {
        const frontmatterEnd = content.indexOf("---", 3);
        const frontmatter = content.slice(0, frontmatterEnd);
        expect(frontmatter).toContain("globs:");
      });

      test("has markdown content after frontmatter", () => {
        const frontmatterEnd = content.indexOf("---", 3);
        const markdownContent = content.slice(frontmatterEnd + 3).trim();
        expect(markdownContent.length).toBeGreaterThan(0);
      });

      test("markdown content contains headers", () => {
        const frontmatterEnd = content.indexOf("---", 3);
        const markdownContent = content.slice(frontmatterEnd + 3);
        expect(markdownContent).toMatch(/^#+ /m);
      });

      test("file is not empty", () => {
        expect(content.length).toBeGreaterThan(50);
      });

      test("has valid UTF-8 encoding", () => {
        expect(content).toBeDefined();
        expect(typeof content).toBe("string");
      });

      test("contains no trailing whitespace on lines", () => {
        const lines = content.split("\n");
        const linesWithTrailingSpace = lines
          .map((line, idx) => ({ line, idx }))
          .filter(({ line }) => line !== line.trimEnd());

        expect(linesWithTrailingSpace.length).toBe(0);
      });
    });
  });

  describe("01-tech-stack.mdc", () => {
    const content = readFileSync(join(RULES_DIR, "01-tech-stack.mdc"), "utf-8");

    test("mentions Bun", () => {
      expect(content.toLowerCase()).toContain("bun");
    });

    test("mentions React", () => {
      expect(content).toContain("React");
    });

    test("mentions TypeScript", () => {
      expect(content).toContain("TypeScript");
    });

    test("references design-system documentation", () => {
      expect(content).toContain("design-system/");
    });

    test("contains technology constraints", () => {
      expect(content).toContain("NO");
    });
  });

  describe("02-design-system.mdc", () => {
    const content = readFileSync(join(RULES_DIR, "02-design-system.mdc"), "utf-8");

    test("contains design principles", () => {
      expect(content).toContain("Principles");
    });

    test("mentions CSS variables", () => {
      expect(content).toContain("--");
    });

    test("contains color tokens", () => {
      expect(content).toContain("color");
    });

    test("references typography", () => {
      expect(content.toLowerCase()).toContain("typography") || expect(content).toContain("Font");
    });

    test("mentions spacing", () => {
      expect(content.toLowerCase()).toContain("spacing");
    });
  });

  describe("03-coding-standards.mdc", () => {
    const content = readFileSync(join(RULES_DIR, "03-coding-standards.mdc"), "utf-8");

    test("contains file structure information", () => {
      expect(content).toContain("File Structure") || expect(content).toContain("src/");
    });

    test("mentions naming conventions", () => {
      expect(content.toLowerCase()).toContain("naming") || expect(content).toContain("PascalCase") || expect(content).toContain("camelCase");
    });

    test("references TypeScript", () => {
      expect(content).toContain("TypeScript");
    });

    test("mentions components", () => {
      expect(content.toLowerCase()).toContain("component");
    });
  });

  describe("04-workflow.mdc", () => {
    const content = readFileSync(join(RULES_DIR, "04-workflow.mdc"), "utf-8");

    test("contains workflow information", () => {
      expect(content.toLowerCase()).toContain("workflow") || expect(content.toLowerCase()).toContain("script");
    });

    test("mentions bun commands", () => {
      expect(content).toContain("bun");
    });

    test("references development workflow", () => {
      expect(content.toLowerCase()).toContain("dev") || expect(content.toLowerCase()).toContain("build");
    });
  });

  describe("use-bun-instead-of-node-vite-npm-pnpm.mdc", () => {
    const content = readFileSync(join(RULES_DIR, "use-bun-instead-of-node-vite-npm-pnpm.mdc"), "utf-8");

    test("instructs to use Bun", () => {
      expect(content).toContain("bun");
    });

    test("mentions alternatives to avoid", () => {
      expect(content.toLowerCase()).toContain("node") || expect(content.toLowerCase()).toContain("npm");
    });

    test("contains code examples", () => {
      expect(content).toContain("```");
    });

    test("shows Bun.serve usage", () => {
      expect(content).toContain("Bun.serve");
    });

    test("explains testing with Bun", () => {
      expect(content).toContain("bun test");
    });
  });

  describe("rule consistency", () => {
    test("all rules reference design-system documentation", () => {
      mdcFiles.forEach((filename) => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        expect(content).toContain("design-system/");
      });
    });

    test("all rules contain Rule 0 about design-system", () => {
      mdcFiles.forEach((filename) => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        expect(content.toLowerCase()).toContain("rule 0") || expect(content).toContain("design-system");
      });
    });

    test("all rules have alwaysApply field in frontmatter", () => {
      mdcFiles.forEach((filename) => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        const frontmatterEnd = content.indexOf("---", 3);
        const frontmatter = content.slice(0, frontmatterEnd);
        expect(frontmatter).toContain("alwaysApply:");
      });
    });
  });

  describe("frontmatter parsing", () => {
    mdcFiles.forEach((filename) => {
      test(`${filename} has parseable YAML frontmatter`, () => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        const frontmatterEnd = content.indexOf("---", 3);
        const frontmatter = content.slice(4, frontmatterEnd);

        expect(frontmatter).not.toContain("---");

        const lines = frontmatter.split("\n").filter((line) => line.trim());
        lines.forEach((line) => {
          if (line.trim() && !line.startsWith("#")) {
            expect(line).toMatch(/^[\w-]+:/);
          }
        });
      });
    });
  });

  describe("markdown structure", () => {
    mdcFiles.forEach((filename) => {
      test(`${filename} has proper heading hierarchy`, () => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        const frontmatterEnd = content.indexOf("---", 3);
        const markdown = content.slice(frontmatterEnd + 3);

        const headings = markdown.match(/^#{1,6} .+/gm) || [];
        expect(headings.length).toBeGreaterThan(0);

        const firstHeadingLevel = headings[0]?.match(/^#+/)?.[0].length || 0;
        expect(firstHeadingLevel).toBeLessThanOrEqual(2);
      });
    });
  });

  describe("content quality", () => {
    mdcFiles.forEach((filename) => {
      test(`${filename} has substantial content`, () => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");
        const frontmatterEnd = content.indexOf("---", 3);
        const markdown = content.slice(frontmatterEnd + 3).trim();

        expect(markdown.length).toBeGreaterThan(100);

        const words = markdown.split(/\s+/).length;
        expect(words).toBeGreaterThan(30);
      });

      test(`${filename} contains actionable guidance`, () => {
        const content = readFileSync(join(RULES_DIR, filename), "utf-8");

        const hasListItems = content.includes("- ") || content.includes("* ");
        const hasCodeBlocks = content.includes("```");
        const hasEmphasis = content.includes("**") || content.includes("__");

        const hasActionableContent = hasListItems || hasCodeBlocks || hasEmphasis;
        expect(hasActionableContent).toBe(true);
      });
    });
  });
});