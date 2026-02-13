import { getLanguages, getUsage, translate } from "../translator/translate";
import { DeepLError, type TranslateRequest } from "../translator/types";
const MAX_TEXT_BYTES = 128 * 1024;
let convexUrlCache: string | null | undefined;
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

export async function handleConfig(): Promise<Response> {
  const convexUrl = await resolveConvexUrl();
  if (!convexUrl) return errorResponse("Missing CONVEX_URL", 500);
  return jsonResponse({ convexUrl });
}
