# Translato

Fast, minimal online translator powered by DeepL.

![Bun](https://img.shields.io/badge/runtime-bun-black)
![React](https://img.shields.io/badge/frontend-react%2019-61dafb)
![Convex](https://img.shields.io/badge/backend-convex-orange)
![Clerk](https://img.shields.io/badge/auth-clerk-6c47ff)

## Screenshots

### Light mode

![Translato light screenshot](public/screenshot-light.png)

### Dark mode

![Translato dark screenshot](public/screenshot-dark.png)

## Features

- Auto-translate on typing with 400ms debounce
- 30+ languages with source auto-detect
- Language swap with animated toggle
- Copy translated text to clipboard
- Responsive layout for desktop and mobile

## Stack

- Runtime: Bun
- Frontend: React 19 + Vite
- Backend: Convex (actions/queries/mutations)
- Auth: Clerk
- Translation API: DeepL Free API
- Styling: Design system tokens (no Tailwind)

## Setup

```bash
bun install
```

Create `.env.local` in the project root:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_key
```

Set these server-side variables in Convex:

- `DEEPL_API_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `INTERNAL_ALLOWED_EMAILS`
- `INTERNAL_ALLOWED_DOMAINS`

Optional runtime flags:

- `ENABLE_VERCEL_ANALYTICS=true` (server/runtime config response)
- `VITE_ENABLE_VERCEL_ANALYTICS=true` (client-side fallback for Vite-driven envs)

## Run

```bash
bun --hot src/server/index.ts
bun run dev:web
```

- `bun --hot src/server/index.ts`: Bun server workflow for local development.
- `bun run dev:web`: Vite SPA workflow used for production builds.

## Project structure

```text
src/
  translator/   Domain: DeepL integration, language data, types
  server/       HTTP: Bun.serve(), local/dev-only routes
  ui/           UI: React components and styles
convex/         Backend: auth-gated actions, queries, mutations
docs/           Design system, tech stack, deployment notes
```

## Production build

```bash
bun run build
```

Build output is generated in `dist/` for Vercel deployment.

## Browser Compatibility Checklist

Target support: latest 2 stable versions of Chrome, Brave, Firefox, and Safari.

1. Chrome: email-code sign-in succeeds and remains logged in after refresh.
2. Brave: with Shields ON, fallback guidance is shown when auth is blocked.
3. Brave: with Shields disabled for this site, sign-in succeeds.
4. Firefox: sign-in succeeds and session persists after refresh.
5. Safari: sign-in succeeds and protected UI renders after navigation.
6. Console: no Clerk script load errors and no CSP worker violations.

## Troubleshooting (Auth/CSP)

If sign-in fails with browser security or script load errors:

1. Hard refresh (`Cmd/Ctrl + Shift + R`).
2. Disable privacy/ad-block extensions for `translato.ai-wave.co`.
3. In Brave, disable Shields for the site and allow third-party cookies.
4. Clear site data (cookies + cache) and retry.
5. Validate production CSP includes `worker-src 'self' blob:` and `child-src 'self' blob:`.

## License

Private, internal use only.
