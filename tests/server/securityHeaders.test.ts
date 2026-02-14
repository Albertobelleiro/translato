import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

type Header = {
  key: string;
  value: string;
};

type VercelConfig = {
  headers?: Array<{
    source: string;
    headers: Header[];
  }>;
};

function getCspValue(config: VercelConfig): string {
  const headerGroups = config.headers ?? [];
  for (const group of headerGroups) {
    const csp = group.headers.find((header) => header.key === "Content-Security-Policy");
    if (csp) return csp.value;
  }
  throw new Error("Content-Security-Policy header not found in vercel.json");
}

describe("security headers", () => {
  test("CSP includes Clerk-compatible worker and child directives", async () => {
    const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8")) as VercelConfig;
    const csp = getCspValue(config);

    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("child-src 'self' blob:");
    expect(csp).toContain("img-src 'self' data: blob: https://img.clerk.com");
  });

  test("CSP allows required Clerk endpoints", async () => {
    const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8")) as VercelConfig;
    const csp = getCspValue(config);

    expect(csp).toContain("script-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.translato.ai-wave.co");
    expect(csp).toContain("connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.com https://*.clerk.accounts.dev https://clerk.translato.ai-wave.co");
    expect(csp).toContain("frame-src https://*.clerk.com https://*.clerk.accounts.dev https://clerk.translato.ai-wave.co");
  });
});
