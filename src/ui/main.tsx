import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { App } from "./App.tsx";
import "./styles/app.css";

async function getConvexClient() {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error("Failed to load app config");
  const data = await res.json() as { convexUrl?: string };
  if (!data.convexUrl) throw new Error("Missing CONVEX_URL. Run `bunx convex dev` to configure it.");
  return new ConvexReactClient(data.convexUrl);
}

const convex = await getConvexClient();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>,
  );
}
