import index from "../ui/index.html";

const DEEPL_URL = "https://api-free.deepl.com/v2";
const DEEPL_KEY = process.env.DEEPL_API_KEY;

if (!DEEPL_KEY) {
  console.error("Missing DEEPL_API_KEY in .env");
  process.exit(1);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Bun.serve({
  routes: {
    "/": index,
  },
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/translate") {
      try {
        const body = await req.json() as { text?: string; source_lang?: string; target_lang?: string };

        if (!body.text?.trim()) return json({ error: "text is required" }, 400);
        if (!body.target_lang) return json({ error: "target_lang is required" }, 400);
        if (new TextEncoder().encode(body.text).length > 128_000) {
          return json({ error: "Text exceeds 128 KiB limit" }, 400);
        }

        const deepLBody: Record<string, unknown> = {
          text: [body.text],
          target_lang: body.target_lang,
          model_type: "latency_optimized",
        };
        if (body.source_lang) deepLBody.source_lang = body.source_lang;

        const res = await fetch(`${DEEPL_URL}/translate`, {
          method: "POST",
          headers: {
            Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deepLBody),
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
          const status = res.status;
          if (status === 403) return json({ error: "Invalid API key" }, 401);
          if (status === 429) return json({ error: "Rate limit exceeded" }, 429);
          if (status === 456) return json({ error: "Quota exceeded" }, 429);
          return json({ error: "Translation service unavailable" }, 502);
        }

        const data = await res.json() as { translations: Array<{ detected_source_language: string; text: string }> };
        const t = data.translations[0];
        return json({
          translatedText: t?.text ?? "",
          detectedSourceLang: t?.detected_source_language ?? "",
        });
      } catch (e) {
        if (e instanceof Error && e.name === "TimeoutError") {
          return json({ error: "Translation request timed out" }, 504);
        }
        return json({ error: "Internal server error" }, 500);
      }
    }

    if (req.method === "GET" && url.pathname === "/api/languages") {
      try {
        const [sourceRes, targetRes] = await Promise.all([
          fetch(`${DEEPL_URL}/languages?type=source`, {
            headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
            signal: AbortSignal.timeout(5000),
          }),
          fetch(`${DEEPL_URL}/languages?type=target`, {
            headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
            signal: AbortSignal.timeout(5000),
          }),
        ]);
        const source = await sourceRes.json();
        const target = await targetRes.json();
        return json({ source, target });
      } catch {
        return json({ error: "Could not fetch languages" }, 502);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  development: { hmr: true, console: true },
});

console.log("Translato running on http://localhost:3000");
