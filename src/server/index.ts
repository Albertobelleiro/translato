import index from "../ui/index.html";
import { handleConfig, handleLanguages, handleUsage } from "./routes.ts";

if (!process.env.DEEPL_API_KEY) {
  console.error("Missing DEEPL_API_KEY in .env");
  process.exit(1);
}

Bun.serve({
  routes: {
    "/": index,
    "/api/languages": {
      GET: handleLanguages,
    },
    "/api/usage": {
      GET: handleUsage,
    },
    "/api/config": {
      GET: handleConfig,
    },
  },
  development: { hmr: true, console: true },
});

console.log("Translato running on http://localhost:3000");
