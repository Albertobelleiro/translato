# Translato — Backend Plan

## Overview
A minimal Bun server that serves the frontend HTML and proxies translation requests to the DeepL API. Three routes total, no database, no external packages. Bun auto-loads `.env` for the API key.

## File Structure
```
├── index.ts              # Bun.serve() entry — routes, HTML import, CORS
├── deepl.ts              # DeepL API wrapper — translate + languages
├── types.ts              # Shared TypeScript types for API shapes
├── index.html            # HTML shell (imports frontend.tsx)
├── .env                  # DEEPL_API_KEY=...
└── frontend/             # (owned by UI plan — not touched here)
```

## Server Setup

### index.ts
- [ ] Import HTML: `import homepage from "./index.html"`
- [ ] `Bun.serve()` on port `process.env.PORT || 3000`
- [ ] Route matching via `new URL(req.url).pathname` and `req.method`
- [ ] Add CORS headers to all responses: `Access-Control-Allow-Origin: *`, `Allow-Methods: GET, POST, OPTIONS`, `Allow-Headers: Content-Type`
- [ ] Handle `OPTIONS` preflight → return `204` with CORS headers
- [ ] Wrap route handlers in try/catch → return `{ error: string }` JSON with appropriate status
- [ ] Validate `DEEPL_API_KEY` exists on startup — log error and exit if missing
- [ ] Dev command: `bun --hot index.ts`

### index.html
- [ ] Minimal HTML5 shell: `<div id="root"></div>` + `<script type="module" src="./frontend/frontend.tsx"></script>`
- [ ] Link CSS: `<link rel="stylesheet" href="./frontend/styles/app.css">`
- [ ] Meta viewport for mobile, title "Translato", dark `<meta name="theme-color" content="#0A0A0B">`

## API Routes

### GET /
- [ ] Return `new Response(homepage)` — Bun serves the bundled HTML

### POST /api/translate
- **Request body:** `{ text: string, source_lang?: string, target_lang: string }`
- **Response:** `{ translatedText: string, detectedSourceLang: string }`
- [ ] Parse JSON body with `await req.json()`
- [ ] Validate: `text` is non-empty string, `target_lang` is non-empty string
- [ ] Validate: `text` length ≤ 128,000 bytes — return `400` if exceeded
- [ ] Call `deepl.translate(text, targetLang, sourceLang?)` from `deepl.ts`
- [ ] Map response: `translations[0].text` → `translatedText`, `translations[0].detected_source_language` → `detectedSourceLang`
- [ ] Error mapping: DeepL `403` → `401 "Invalid API key"`, DeepL `429` → `429 "Rate limit exceeded"`, DeepL `456` → `429 "Quota exceeded"`, DeepL `5xx` → `502 "Translation service unavailable"`

### GET /api/languages
- **Response:** `{ languages: Array<{ code: string, name: string }> }`
- [ ] Fetch from DeepL `GET /v2/languages?type=target` on first call, then cache in-memory
- [ ] Include both source and target lists: call with `type=source` and `type=target`
- [ ] Return cached result on subsequent calls (cache for 24h or until restart)
- [ ] Fallback: if DeepL is unreachable, return a hardcoded list of top 30 languages

### GET /api/usage (optional)
- **Response:** `{ character_count: number, character_limit: number }`
- [ ] Proxy `GET https://api-free.deepl.com/v2/usage` with auth header
- [ ] Return the raw DeepL response as-is

## DeepL Integration

### deepl.ts
- [ ] Export `translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslateResult>`
- [ ] Export `getLanguages(type: "source" | "target"): Promise<Language[]>`
- [ ] Export `getUsage(): Promise<UsageResult>`
- [ ] Base URL constant: `https://api-free.deepl.com/v2`
- [ ] Auth header: `Authorization: DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
- [ ] Content-Type: `application/json`
- [ ] Use `model_type: "latency_optimized"` for faster responses
- [ ] Set `AbortSignal.timeout(5000)` on every fetch — throw on timeout
- [ ] Throw typed errors with `status` and `message` for the route handler to map

## Types

### types.ts
- [ ] `TranslateRequest` — `{ text: string, source_lang?: string, target_lang: string }`
- [ ] `TranslateResponse` — `{ translatedText: string, detectedSourceLang: string }`
- [ ] `DeepLTranslateBody` — `{ text: string[], target_lang: string, source_lang?: string, model_type?: string }`
- [ ] `DeepLTranslateResult` — `{ translations: Array<{ detected_source_language: string, text: string }> }`
- [ ] `Language` — `{ code: string, name: string }`
- [ ] `DeepLError` — custom error class with `status: number` and `message: string`

## Development
- [ ] Start dev: `bun --hot index.ts`
- [ ] Test translate endpoint: `curl -X POST http://localhost:3000/api/translate -H 'Content-Type: application/json' -d '{"text":"hello","target_lang":"ES"}'`
- [ ] Test languages endpoint: `curl http://localhost:3000/api/languages`
- [ ] Verify `.env` is in `.gitignore`
