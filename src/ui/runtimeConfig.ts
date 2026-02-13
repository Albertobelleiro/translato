export type PublicRuntimeConfig = {
  convexUrl: string;
  clerkPublishableKey: string;
};

type ProcessWithEnv = {
  env?: Record<string, string | undefined>;
};

function readProcessEnv(key: string): string | undefined {
  const processRef = (globalThis as { process?: ProcessWithEnv }).process;
  return processRef?.env?.[key];
}

function readClientEnv(key: string): string | undefined {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.[key];
}

function readEnv(key: string): string | undefined {
  if (key === "VITE_CONVEX_URL") {
    return readClientEnv("VITE_CONVEX_URL")
      ?? readClientEnv("CONVEX_URL")
      ?? readProcessEnv("VITE_CONVEX_URL")
      ?? readProcessEnv("CONVEX_URL");
  }

  if (key === "VITE_CLERK_PUBLISHABLE_KEY") {
    return readClientEnv("VITE_CLERK_PUBLISHABLE_KEY")
      ?? readClientEnv("CLERK_PUBLISHABLE_KEY")
      ?? readProcessEnv("VITE_CLERK_PUBLISHABLE_KEY")
      ?? readProcessEnv("CLERK_PUBLISHABLE_KEY");
  }

  return readClientEnv(key) ?? readProcessEnv(key);
}

function requireEnv(key: string, helpText: string): string {
  const value = readEnv(key);
  if (!value || !value.trim()) {
    throw new Error(`Missing ${key}. ${helpText}`);
  }
  return value.trim();
}

function validateConvexUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("VITE_CONVEX_URL must be a valid https URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("CONVEX URL must use https");
  }

  return value;
}

function validateClerkKey(value: string): string {
  if (!value.startsWith("pk_")) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY must start with pk_");
  }
  return value;
}

export function loadPublicRuntimeConfig(): PublicRuntimeConfig {
  const convexUrl = validateConvexUrl(
    requireEnv("VITE_CONVEX_URL", "Set it in .env.local for development and in Vercel for deployments."),
  );
  const clerkPublishableKey = validateClerkKey(
    requireEnv(
      "VITE_CLERK_PUBLISHABLE_KEY",
      "Set the production pk_live_* key in Vercel and a test key for local development.",
    ),
  );

  return {
    convexUrl,
    clerkPublishableKey,
  };
}
