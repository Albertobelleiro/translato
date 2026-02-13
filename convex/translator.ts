import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { requireUser } from "./helpers";
import { mapDeepLError } from "./lib/errors";

const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

export const translate = action({
  args: {
    text: v.string(),
    sourceLang: v.optional(v.string()),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.text.trim()) throw new Error("Text must not be empty");
    if (new TextEncoder().encode(args.text).length >= 128 * 1024) throw new Error("Text exceeds 128 KiB limit");

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

    await requireUser(ctx);

    await ctx.runMutation(api.translations.save, {
      sourceText: args.text,
      targetText: translatedText,
      sourceLang: args.sourceLang || "auto",
      targetLang: args.targetLang,
      detectedSourceLang,
      characterCount: args.text.length,
    });

    await ctx.runMutation(api.stats.record, {
      characterCount: args.text.length,
    });

    return { translatedText, detectedSourceLang };
  },
});
