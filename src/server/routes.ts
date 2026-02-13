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

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function handleTranslate(req: Request): Promise<Response> {
  try {
    let body: Partial<TranslateRequest>;
    try {
      body = (await req.json()) as Partial<TranslateRequest>;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse("Malformed JSON body", 400);
      }
      throw error;
    }

    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      return errorResponse("text is required and must be a non-empty string", 400);
    }
    if (
      !body.target_lang ||
      typeof body.target_lang !== "string" ||
      body.target_lang.trim() === ""
    ) {
      return errorResponse("target_lang is required and must be a non-empty string", 400);
    }
    if (new TextEncoder().encode(body.text).byteLength > MAX_TEXT_BYTES) {
      return errorResponse("text exceeds maximum length of 128,000 bytes", 400);
    }

    const result = await translate(body.text, body.target_lang, body.source_lang);
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof DeepLError) {
      const mapped =
        error.status === 403
          ? { status: 401, message: "Invalid API key" }
          : error.status === 456
            ? { status: 429, message: "Quota exceeded" }
            : { status: error.status, message: error.message };
      return errorResponse(mapped.message, mapped.status);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function handleLanguages(): Promise<Response> {
  try {
    const [source, target] = await Promise.all([
      getLanguages("source"),
      getLanguages("target"),
    ]);
    return jsonResponse({
      source: source.map((l) => ({ code: l.language, name: l.name })),
      target: target.map((l) => ({ code: l.language, name: l.name })),
    });
  } catch (error) {
    if (error instanceof DeepLError) {
      // Fallback: return hardcoded list
      const fallback = getFallbackLanguages();
      return jsonResponse({ source: fallback, target: fallback });
    }
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

export async function handleConfig(): Promise<Response> {
  const [convexUrl, clerkPublishableKey] = await Promise.all([
    resolveConvexUrl(),
    resolveClerkPublishableKey(),
  ]);
  if (!convexUrl) return errorResponse("Missing CONVEX_URL", 500);
  if (!clerkPublishableKey) return errorResponse("Missing CLERK_PUBLISHABLE_KEY", 500);

  return jsonResponse({ convexUrl, clerkPublishableKey });
}
