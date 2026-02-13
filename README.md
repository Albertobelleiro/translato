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
- **Frontend:** React 19, CSS custom properties
- **Backend:** Bun.serve() with route handlers
- **API:** DeepL Free API
- **Styling:** Design system tokens (no Tailwind)

## Setup

```bash
bun install
```

Create `.env` in the project root:

```
DEEPL_API_KEY=your_key_here
```

Get a free API key at [deepl.com/pro-api](https://www.deepl.com/pro-api).

## Run

```bash
bun --hot src/server/index.ts
```

Open [localhost:3000](http://localhost:3000).

## Structure

```
src/
  translator/   Domain -- DeepL integration, language data, types
  server/       HTTP -- Bun.serve(), API routes
  ui/           Presentation -- React components, styles
docs/           Design system, techstack, TODO plans
```

## License

Private -- internal use.
