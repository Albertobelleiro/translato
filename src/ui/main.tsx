import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";
import "./styles/app.css";

type RuntimeConfig = {
  convexUrl?: string;
  clerkPublishableKey?: string;
};

const clientEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

async function loadRuntimeConfig(): Promise<{ convexUrl: string; clerkPublishableKey: string }> {
  let convexUrl = clientEnv?.CONVEX_URL;
  let clerkPublishableKey = clientEnv?.CLERK_PUBLISHABLE_KEY ?? clientEnv?.VITE_CLERK_PUBLISHABLE_KEY;

  if (!convexUrl || !clerkPublishableKey) {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Unable to load runtime config from /api/config");
    const config = await response.json() as RuntimeConfig;
    convexUrl ??= config.convexUrl;
    clerkPublishableKey ??= config.clerkPublishableKey;
  }

  if (!convexUrl) throw new Error("Missing CONVEX_URL. Run `bunx convex dev` to configure it.");
  if (!clerkPublishableKey) throw new Error("Missing CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY) in .env");
  return { convexUrl, clerkPublishableKey };
}

const root = document.getElementById("root");
async function boot(): Promise<void> {
  if (!root) return;

  const { convexUrl, clerkPublishableKey } = await loadRuntimeConfig();
  const convex = new ConvexReactClient(convexUrl);

  createRoot(root).render(
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        variables: {
          colorPrimary: "#4D76FF",
          colorBackground: "#1A1D21",
          colorText: "#EEEFF1",
          colorInputBackground: "#242529",
          colorInputText: "#EEEFF1",
          borderRadius: "10px",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>,
  );
}

void boot().catch((error: unknown) => {
  console.error(error);
  if (root) {
    root.textContent = error instanceof Error ? error.message : "Failed to initialize app";
  }
});
