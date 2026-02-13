import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { requireUser } from "./helpers";
import { mapDeepLError } from "./lib/errors";

const DEEPL_URL = "https://api-free.deepl.com/v2/translate";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitBucket = {
  count: number;
  windowStartedAt: number;
};

// Best-effort burst protection for translation calls.
const translationRateLimitBuckets = new Map<string, RateLimitBucket>();

function consumeTranslationToken(userId: string): number | null {
  const now = Date.now();
  const existing = translationRateLimitBuckets.get(userId);

  if (!existing || now - existing.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    translationRateLimitBuckets.set(userId, { count: 1, windowStartedAt: now });
    return null;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return RATE_LIMIT_WINDOW_MS - (now - existing.windowStartedAt);
  }

  existing.count += 1;
  translationRateLimitBuckets.set(userId, existing);
  return null;
}

export const translate = action({
  args: {
    text: v.string(),
    sourceLang: v.optional(v.string()),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.text.trim()) throw new Error("Text must not be empty");
    if (new TextEncoder().encode(args.text).length >= 128 * 1024) throw new Error("Text exceeds 128 KiB limit");

    const user = await requireUser(ctx);
    const retryAfterMs = consumeTranslationToken(user.id);
    if (retryAfterMs !== null) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
    }

    const body: {
      text: string[];
      target_lang: string;
      source_lang?: string;
      model_type: string;
    } = {
      text: [args.text],
      target_lang: args.targetLang,
      model_type: "latency_optimized",
    };

    if (args.sourceLang && args.sourceLang !== "auto") body.source_lang = args.sourceLang;

    const key = process.env.DEEPL_API_KEY;
    if (!key) throw new Error("DEEPL_API_KEY is not configured in Convex env");

    let response: Response;
    try {
      response = await fetch(DEEPL_URL, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new Error("Translation service unavailable");
    }

    if (!response.ok) {
      const mapped = mapDeepLError(response.status);
      throw new Error(mapped.message);
    }

    const data = await response.json() as {
      translations: Array<{ detected_source_language: string; text: string }>;
    };
    const first = data.translations[0];
    const translatedText = first?.text ?? "";
    const detectedSourceLang = first?.detected_source_language ?? "";

    await ctx.runMutation(api.stats.record, {
      characterCount: args.text.length,
    });

    return { translatedText, detectedSourceLang };
  },
});
