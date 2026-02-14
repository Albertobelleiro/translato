import { MAX_TEXT_BYTES } from "../shared/constants.ts";
import {
  getFallbackLanguages,
  getLanguages,
  getUsage,
  translate,
} from "../translator/translate.ts";
import { DeepLError } from "../translator/types.ts";
import type { TranslateRequest } from "../translator/types.ts";

let convexUrlCache: string | null | undefined;
let clerkPublishableKeyCache: string | null | undefined;
let enableVercelAnalyticsCache: boolean | undefined;

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredAllowedOrigins.length > 0 ? configuredAllowedOrigins : DEFAULT_ALLOWED_ORIGINS,
);
const defaultAllowedOrigin = configuredAllowedOrigins[0] ?? DEFAULT_ALLOWED_ORIGINS[0] ?? "http://localhost:5173";

function resolveAllowedOrigin(req?: Request): string {
  const requestOrigin = req?.headers.get("Origin")?.trim();
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    return requestOrigin;
  }
  return defaultAllowedOrigin;
}

function corsHeaders(req?: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": resolveAllowedOrigin(req),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function withCors(req: Request | undefined, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders(req))) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(req: Request | undefined, data: unknown, status = 200): Response {
  return withCors(req, new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

function errorResponse(req: Request | undefined, message: string, status: number): Response {
  return jsonResponse(req, { error: message }, status);
}

export function handleOptions(req?: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

function stripEnvValue(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export async function handleTranslate(req: Request): Promise<Response> {
  try {
    let body: Partial<TranslateRequest>;
    try {
      body = (await req.json()) as Partial<TranslateRequest>;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse(req, "Malformed JSON body", 400);
      }
      throw error;
    }

    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      return errorResponse(req, "text is required and must be a non-empty string", 400);
    }
    if (
      !body.target_lang ||
      typeof body.target_lang !== "string" ||
      body.target_lang.trim() === ""
    ) {
      return errorResponse(req, "target_lang is required and must be a non-empty string", 400);
    }
    if (new TextEncoder().encode(body.text).byteLength > MAX_TEXT_BYTES) {
      return errorResponse(req, "text exceeds maximum length of 128,000 bytes", 400);
    }

    const result = await translate(body.text, body.target_lang, body.source_lang);
    return jsonResponse(req, result);
  } catch (error) {
    if (error instanceof DeepLError) {
      const mapped =
        error.status === 403
          ? { status: 401, message: "Invalid API key" }
          : error.status === 456
            ? { status: 429, message: "Quota exceeded" }
            : { status: error.status, message: error.message };
      return errorResponse(req, mapped.message, mapped.status);
    }
    return errorResponse(req, "Internal server error", 500);
  }
}

export async function handleLanguages(req?: Request): Promise<Response> {
  try {
    const [source, target] = await Promise.all([
      getLanguages("source"),
      getLanguages("target"),
    ]);
    return jsonResponse(req, {
      source: source.map((l) => ({ code: l.language, name: l.name })),
      target: target.map((l) => ({ code: l.language, name: l.name })),
    });
  } catch (error) {
    if (error instanceof DeepLError) {
      // Fallback: return hardcoded list
      const fallback = getFallbackLanguages();
      return jsonResponse(req, { source: fallback, target: fallback });
    }
    return errorResponse(req, "Internal server error", 500);
  }
}

export async function handleUsage(req?: Request): Promise<Response> {
  try {
    return jsonResponse(req, await getUsage());
  } catch (error) {
    if (error instanceof DeepLError) return errorResponse(req, error.message, error.status);
    return errorResponse(req, "Internal server error", 500);
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
    convexUrlCache = match?.[1] ? stripEnvValue(match[1]) : null;
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
      clerkPublishableKeyCache = stripEnvValue(clerkMatch[1]);
      return clerkPublishableKeyCache;
    }

    const viteMatch = envLocal.match(/^VITE_CLERK_PUBLISHABLE_KEY=(.+)$/m);
    clerkPublishableKeyCache = viteMatch?.[1] ? stripEnvValue(viteMatch[1]) : null;
    return clerkPublishableKeyCache;
  } catch {
    clerkPublishableKeyCache = null;
    return clerkPublishableKeyCache;
  }
}

function resolveEnableVercelAnalytics(): boolean {
  if (enableVercelAnalyticsCache !== undefined) return enableVercelAnalyticsCache;

  enableVercelAnalyticsCache = parseBooleanEnv(process.env.ENABLE_VERCEL_ANALYTICS)
    || parseBooleanEnv(process.env.VITE_ENABLE_VERCEL_ANALYTICS);
  return enableVercelAnalyticsCache;
}

export async function handleConfig(req?: Request): Promise<Response> {
  const [convexUrl, clerkPublishableKey] = await Promise.all([
    resolveConvexUrl(),
    resolveClerkPublishableKey(),
  ]);
  const enableVercelAnalytics = resolveEnableVercelAnalytics();
  if (!convexUrl) return errorResponse(req, "Missing CONVEX_URL", 500);
  if (!clerkPublishableKey) return errorResponse(req, "Missing CLERK_PUBLISHABLE_KEY", 500);

  return jsonResponse(req, { convexUrl, clerkPublishableKey, enableVercelAnalytics });
}
