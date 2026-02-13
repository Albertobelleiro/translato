import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function assertPublicEnv(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name}. Set it in your deployment environment before building.`);
  }
  return value.trim();
}

function resolvePublicEnv(
  env: Record<string, string>,
  canonical: string,
  legacy: string,
): string | undefined {
  return env[canonical] ?? env[legacy];
}

function assertConvexUrl(value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("VITE_CONVEX_URL must be a valid https URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("VITE_CONVEX_URL must use https");
  }
}

function assertClerkPublishableKey(value: string): void {
  if (!value.startsWith("pk_")) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY must start with pk_");
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === "build" && process.env.SKIP_PUBLIC_ENV_VALIDATION !== "1") {
    const env = loadEnv(mode, process.cwd(), "");
    const convexUrl = assertPublicEnv(
      "VITE_CONVEX_URL",
      resolvePublicEnv(env, "VITE_CONVEX_URL", "CONVEX_URL"),
    );
    const clerkKey = assertPublicEnv(
      "VITE_CLERK_PUBLISHABLE_KEY",
      resolvePublicEnv(env, "VITE_CLERK_PUBLISHABLE_KEY", "CLERK_PUBLISHABLE_KEY"),
    );
    assertConvexUrl(convexUrl);
    assertClerkPublishableKey(clerkKey);
  }

  return {
    plugins: [react()],
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
