import { getLanguages, getUsage } from "../translator/translate.ts";
import { DeepLError } from "../translator/types.ts";
let convexUrlCache: string | null | undefined;
let clerkPublishableKeyCache: string | null | undefined;
let internalAllowedEmailsCache: string[] | undefined;
let internalAllowedDomainsCache: string[] | undefined;
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}
export async function handleLanguages(): Promise<Response> {
  try {
    const languages = await getLanguages("target");
    return jsonResponse({ languages });
  } catch (error) {
    if (error instanceof DeepLError) return errorResponse(error.message, error.status);
    return errorResponse("Internal server error", 500);
  }
}
export async function handleUsage(): Promise<Response> {
  try {
    return jsonResponse(await getUsage());
  } catch (error) {
    if (error instanceof DeepLError) return errorResponse(error.message, error.status);
    return errorResponse("Internal server error", 500);
  }
}

async function resolveConvexUrl(): Promise<string | null> {
  if (convexUrlCache !== undefined) return convexUrlCache;
  if (process.env.CONVEX_URL) {
    convexUrlCache = process.env.CONVEX_URL;
    return convexUrlCache;
  }

  try {
    const envLocal = await Bun.file(".env.local").text();
    const match = envLocal.match(/^CONVEX_URL=(.+)$/m);
    convexUrlCache = match?.[1]?.trim() ?? null;
    return convexUrlCache;
  } catch {
    convexUrlCache = null;
    return convexUrlCache;
  }
}

async function resolveClerkPublishableKey(): Promise<string | null> {
  if (clerkPublishableKeyCache !== undefined) return clerkPublishableKeyCache;

  if (process.env.CLERK_PUBLISHABLE_KEY) {
    clerkPublishableKeyCache = process.env.CLERK_PUBLISHABLE_KEY;
    return clerkPublishableKeyCache;
  }

  if (process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    clerkPublishableKeyCache = process.env.VITE_CLERK_PUBLISHABLE_KEY;
    return clerkPublishableKeyCache;
  }

  try {
    const envLocal = await Bun.file(".env.local").text();
    const clerkMatch = envLocal.match(/^CLERK_PUBLISHABLE_KEY=(.+)$/m);
    if (clerkMatch?.[1]) {
      clerkPublishableKeyCache = clerkMatch[1].trim();
      return clerkPublishableKeyCache;
    }

    const viteMatch = envLocal.match(/^VITE_CLERK_PUBLISHABLE_KEY=(.+)$/m);
    clerkPublishableKeyCache = viteMatch?.[1]?.trim() ?? null;
    return clerkPublishableKeyCache;
  } catch {
    clerkPublishableKeyCache = null;
    return clerkPublishableKeyCache;
  }
}

function parseAllowList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseAllowListFromEnvFile(envLocal: string, key: string): string[] {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = envLocal.match(new RegExp(`^${escapedKey}=(.+)$`, "m"));
  return parseAllowList(match?.[1]?.trim());
}

async function resolveInternalAllowedEmails(): Promise<string[]> {
  if (internalAllowedEmailsCache !== undefined) return internalAllowedEmailsCache;

  const fromEnv = parseAllowList(process.env.INTERNAL_ALLOWED_EMAILS);
  if (fromEnv.length > 0) {
    internalAllowedEmailsCache = fromEnv;
    return internalAllowedEmailsCache;
  }

  try {
    const envLocal = await Bun.file(".env.local").text();
    internalAllowedEmailsCache = parseAllowListFromEnvFile(envLocal, "INTERNAL_ALLOWED_EMAILS");
    return internalAllowedEmailsCache;
  } catch {
    internalAllowedEmailsCache = [];
    return internalAllowedEmailsCache;
  }
}

async function resolveInternalAllowedDomains(): Promise<string[]> {
  if (internalAllowedDomainsCache !== undefined) return internalAllowedDomainsCache;

  const fromEnv = parseAllowList(process.env.INTERNAL_ALLOWED_DOMAINS);
  if (fromEnv.length > 0) {
    internalAllowedDomainsCache = fromEnv;
    return internalAllowedDomainsCache;
  }

  try {
    const envLocal = await Bun.file(".env.local").text();
    internalAllowedDomainsCache = parseAllowListFromEnvFile(envLocal, "INTERNAL_ALLOWED_DOMAINS");
    return internalAllowedDomainsCache;
  } catch {
    internalAllowedDomainsCache = [];
    return internalAllowedDomainsCache;
  }
}

export async function handleConfig(): Promise<Response> {
  const [convexUrl, clerkPublishableKey, internalAllowedEmails, internalAllowedDomains] = await Promise.all([
    resolveConvexUrl(),
    resolveClerkPublishableKey(),
    resolveInternalAllowedEmails(),
    resolveInternalAllowedDomains(),
  ]);
  if (!convexUrl) return errorResponse("Missing CONVEX_URL", 500);
  if (!clerkPublishableKey) return errorResponse("Missing CLERK_PUBLISHABLE_KEY", 500);
  if (internalAllowedEmails.length === 0 && internalAllowedDomains.length === 0) {
    return errorResponse("Missing INTERNAL_ALLOWED_EMAILS or INTERNAL_ALLOWED_DOMAINS", 500);
  }

  return jsonResponse({ convexUrl, clerkPublishableKey, internalAllowedEmails, internalAllowedDomains });
}
