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

function mapDeepLStatus(status: number): { error: string; status: number } {
  if (status === 403) return { error: "Invalid API key", status: 401 };
  if (status === 429) return { error: "Rate limit exceeded", status: 429 };
  if (status === 456) return { error: "Quota exceeded", status: 429 };
  return { error: "Translation service unavailable", status: 502 };
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
          const deepLStatus = mapDeepLStatus(res.status);
          return json({ error: deepLStatus.error }, deepLStatus.status);
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
        const headers = { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` };
        const [sourceRes, targetRes] = await Promise.all([
          fetch(`${DEEPL_URL}/languages?type=source`, { headers, signal: AbortSignal.timeout(5000) }),
          fetch(`${DEEPL_URL}/languages?type=target`, { headers, signal: AbortSignal.timeout(5000) }),
        ]);

        const failedRes = !sourceRes.ok ? sourceRes : !targetRes.ok ? targetRes : null;
        if (failedRes) {
          // Drain bodies to avoid connection leaks
          await sourceRes.body?.cancel();
          await targetRes.body?.cancel();
          const mapped = mapDeepLStatus(failedRes.status);
          return json({ error: mapped.error }, mapped.status);
        }

        const [source, target] = await Promise.all([sourceRes.json(), targetRes.json()]);

        if (!Array.isArray(source) || !Array.isArray(target)) {
          return json({ error: "Unexpected response from language service" }, 502);
        }

        return json({ source, target });
      } catch (e) {
        if (e instanceof Error && e.name === "TimeoutError") {
          return json({ error: "Language request timed out" }, 504);
        }
        return json({ error: "Could not fetch languages" }, 502);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  development: { hmr: true, console: true },
});

console.log("Translato running on http://localhost:3000");
