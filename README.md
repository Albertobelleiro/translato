# translato

Fast, minimal online translator powered by the DeepL API.

## Features

- Auto-translate on typing with 400ms debounce
- 30+ languages with auto-detect for source
- Language swap with animated toggle
- Copy translated text to clipboard
- Dark UI following the AI Wave design system
- Responsive layout that stacks on mobile

## Stack

- **Runtime:** Bun
- **Frontend:** React 19 + Vite build output for static hosting
- **Backend:** Convex (actions/queries/mutations)
- **Auth:** Clerk
- **API:** DeepL Free API (called from Convex action)
- **Styling:** Design system tokens (no Tailwind)

## Setup

```bash
bun install
```

Create `.env.local` in the project root:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_key
```

For Convex server-side variables, set them in the Convex dashboard:
- `DEEPL_API_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `INTERNAL_ALLOWED_EMAILS`
- `INTERNAL_ALLOWED_DOMAINS`

## Run

```bash
bun --hot src/server/index.ts
bun run dev:web
```

- `bun --hot src/server/index.ts` keeps the Bun server workflow.
- `bun run dev:web` runs the Vite SPA workflow used for production builds.

## Structure

```
src/
  translator/   Domain -- DeepL integration, language data, types
  server/       HTTP -- Bun.serve(), local/dev-only routes
  ui/           Presentation -- React components, styles
convex/         Backend -- auth-gated actions, queries, mutations
docs/           Design system, techstack, TODO plans
```

## Production build

```bash
bun run build
```

This outputs static assets to `dist/` for Vercel deployment.

## License

Private -- internal use.
