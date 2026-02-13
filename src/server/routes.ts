import { getLanguages, getUsage, translate } from "../translator/translate.ts";
import { DeepLError, type TranslateRequest } from "../translator/types.ts";
const MAX_TEXT_BYTES = 128 * 1024;
let convexUrlCache: string | null | undefined;
let clerkPublishableKeyCache: string | null | undefined;
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}
export async function handleTranslate(req: Request): Promise<Response> {
  let body: TranslateRequest;
  try {
    body = await req.json() as TranslateRequest;
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }
  if (!body.text?.trim()) return errorResponse("Text must not be empty", 400);
  if (!body.target_lang) return errorResponse("Target language is required", 400);
  if (new TextEncoder().encode(body.text).length >= MAX_TEXT_BYTES) return errorResponse("Text exceeds 128 KiB limit", 400);
  try {
    const result = await translate(body.text, body.target_lang, body.source_lang);
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof DeepLError) return errorResponse(error.message, error.status);
    return errorResponse("Internal server error", 500);
  }
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

export async function handleConfig(): Promise<Response> {
  const [convexUrl, clerkPublishableKey] = await Promise.all([
    resolveConvexUrl(),
    resolveClerkPublishableKey(),
  ]);
  if (!convexUrl) return errorResponse("Missing CONVEX_URL", 500);
  if (!clerkPublishableKey) return errorResponse("Missing CLERK_PUBLISHABLE_KEY", 500);
  return jsonResponse({ convexUrl, clerkPublishableKey });
}
