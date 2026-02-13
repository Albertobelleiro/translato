import index from "../ui/index.html";

import {
  handleConfig,
  handleLanguages,
  handleOptions,
  handleTranslate,
  handleUsage,
} from "./routes.ts";

if (!process.env.DEEPL_API_KEY) {
  console.error("Missing DEEPL_API_KEY in .env");
  process.exit(1);
}

const port = Number(process.env.PORT ?? "3000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT value: ${process.env.PORT}`);
  process.exit(1);
}

try {
  const server = Bun.serve({
    port,
    routes: {
      "/": index,
      "/api/translate": {
        POST: handleTranslate,
        OPTIONS: handleOptions,
      },
      "/api/languages": {
        GET: handleLanguages,
        OPTIONS: handleOptions,
      },
      "/api/usage": {
        GET: handleUsage,
        OPTIONS: handleOptions,
      },
      "/api/config": {
        GET: handleConfig,
        OPTIONS: handleOptions,
      },
      "/favicon.ico": {
        GET: () => new Response(null, { status: 204 }),
      },
    },
    development: { hmr: true, console: true },
  });

  console.log(`Translato running on http://localhost:${server.port}`);
} catch (error) {
  const err = error as { code?: string };
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(`Find process: lsof -nP -iTCP:${port} -sTCP:LISTEN`);
    console.error(`Or run on another port: PORT=3001 bun --hot src/server/index.ts`);
    process.exit(1);
  }
  throw error;
}
