import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { MAX_TEXT_BYTES } from "../src/shared/constants.ts";
import { action } from "./_generated/server";
import { requireUser } from "./helpers";
import { mapDeepLError } from "./lib/errors";

// Free plan: api-free.deepl.com (500k chars/month, key ends in :fx)
// Pro plan:  api.deepl.com      (set DEEPL_API_URL in Convex env vars)
function getDeepLUrl(): string {
  const base = process.env.DEEPL_API_URL ?? "https://api-free.deepl.com";
  return `${base}/v2/translate`;
}
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const statsRecordMutationRef = makeFunctionReference<"mutation">("stats:record");

type RateLimitBucket = {
  count: number;
  windowStartedAt: number;
};

// Best-effort burst protection for translation calls, only effective within a single warm isolate.
const translationRateLimitBuckets = new Map<string, RateLimitBucket>();

export function __resetTranslationRateLimitBucketsForTests(): void {
  translationRateLimitBuckets.clear();
}

function consumeTranslationToken(userId: string): number | null {
  const now = Date.now();

  for (const [bucketUserId, bucket] of translationRateLimitBuckets.entries()) {
    if (now - bucket.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
      translationRateLimitBuckets.delete(bucketUserId);
    }
  }

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
    if (!args.text.trim()) throw new ConvexError("Text must not be empty");
    if (new TextEncoder().encode(args.text).length > MAX_TEXT_BYTES) {
      throw new ConvexError("Text exceeds maximum length of 128,000 bytes");
    }

    const user = await requireUser(ctx);
    const retryAfterMs = consumeTranslationToken(user.id);
    if (retryAfterMs !== null) {
      throw new ConvexError(`Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
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
    if (!key) throw new ConvexError("DEEPL_API_KEY is not configured");

    let response: Response;
    try {
      response = await fetch(getDeepLUrl(), {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ConvexError("Translation service unavailable");
    }

    if (!response.ok) {
      const mapped = mapDeepLError(response.status);
      throw new ConvexError(mapped.message);
    }

    const data = await response.json() as {
      translations: Array<{ detected_source_language: string; text: string }>;
    };
    if (!Array.isArray(data.translations) || data.translations.length === 0) {
      throw new ConvexError("Translation service returned an empty result");
    }
    const first = data.translations[0];
    if (!first?.text || !first?.detected_source_language) {
      throw new ConvexError("Translation service returned an empty result");
    }
    const translatedText = first.text;
    const detectedSourceLang = first.detected_source_language;

    await ctx.runMutation(statsRecordMutationRef, {
      characterCount: args.text.length,
    });

    return { translatedText, detectedSourceLang };
  },
});
