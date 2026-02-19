import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { MAX_TEXT_BYTES } from "../src/shared/constants.ts";
import { action } from "./_generated/server";
import { requireUser } from "./helpers";
import { fromAzureLang, mapAzureError, toAzureLang } from "./lib/azure";

const AZURE_URL = "https://api.cognitive.microsofttranslator.com/translate";
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

    const key = process.env.AZURE_TRANSLATOR_KEY;
    if (!key) throw new ConvexError("AZURE_TRANSLATOR_KEY is not configured");

    const region = process.env.AZURE_TRANSLATOR_REGION ?? "global";
    const azureTarget = toAzureLang(args.targetLang);
    const azureSource = args.sourceLang && args.sourceLang !== "auto"
      ? toAzureLang(args.sourceLang)
      : undefined;

    const url = new URL(AZURE_URL);
    url.searchParams.set("api-version", "3.0");
    url.searchParams.append("to", azureTarget);
    if (azureSource) url.searchParams.set("from", azureSource);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text: args.text }]),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ConvexError("Translation service unavailable");
    }

    if (!response.ok) {
      throw new ConvexError(mapAzureError(response.status));
    }

    type AzureResponse = Array<{
      detectedLanguage?: { language: string; score: number };
      translations: Array<{ text: string; to: string }>;
    }>;

    const data = await response.json() as AzureResponse;
    const first = data[0];
    if (!first?.translations?.[0]?.text) {
      throw new ConvexError("Translation service returned an empty result");
    }

    const translatedText = first.translations[0].text;
    const detectedSourceLang = first.detectedLanguage
      ? fromAzureLang(first.detectedLanguage.language)
      : (args.sourceLang ?? "");

    await ctx.runMutation(statsRecordMutationRef, {
      characterCount: args.text.length,
    });

    return { translatedText, detectedSourceLang };
  },
});
