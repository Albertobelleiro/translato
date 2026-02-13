import { ClerkProvider, SignIn, SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";
import "./styles/app.css";

if (import.meta.hot) {
  import.meta.hot.accept();
}

type RuntimeConfig = {
  convexUrl?: string;
  clerkPublishableKey?: string;
  internalAllowedEmails?: string[];
  internalAllowedDomains?: string[];
};

type LoadedRuntimeConfig = {
  convexUrl: string;
  clerkPublishableKey: string;
  internalAllowedEmails: string[];
  internalAllowedDomains: string[];
};

const clientEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

function parseAllowList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailAllowed(email: string, allowedEmails: string[], allowedDomains: string[]): boolean {
  const normalized = email.toLowerCase();
  if (allowedEmails.includes(normalized)) return true;
  const domain = normalized.split("@")[1] ?? "";
  return domain.length > 0 && allowedDomains.includes(domain);
}

async function loadRuntimeConfig(): Promise<LoadedRuntimeConfig> {
  let convexUrl = clientEnv?.CONVEX_URL;
  let clerkPublishableKey = clientEnv?.CLERK_PUBLISHABLE_KEY ?? clientEnv?.VITE_CLERK_PUBLISHABLE_KEY;
  let internalAllowedEmails = parseAllowList(clientEnv?.INTERNAL_ALLOWED_EMAILS);
  let internalAllowedDomains = parseAllowList(clientEnv?.INTERNAL_ALLOWED_DOMAINS);

  if (!convexUrl || !clerkPublishableKey || (internalAllowedEmails.length === 0 && internalAllowedDomains.length === 0)) {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Unable to load runtime config from /api/config");
    const config = await response.json() as RuntimeConfig;
    convexUrl ??= config.convexUrl;
    clerkPublishableKey ??= config.clerkPublishableKey;
    if (internalAllowedEmails.length === 0) internalAllowedEmails = config.internalAllowedEmails ?? [];
    if (internalAllowedDomains.length === 0) internalAllowedDomains = config.internalAllowedDomains ?? [];
  }

  if (!convexUrl) throw new Error("Missing CONVEX_URL. Run `bunx convex dev` to configure it.");
  if (!clerkPublishableKey) throw new Error("Missing CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY) in .env");
  if (internalAllowedEmails.length === 0 && internalAllowedDomains.length === 0) {
    throw new Error("Missing INTERNAL_ALLOWED_EMAILS or INTERNAL_ALLOWED_DOMAINS in env");
  }

  return { convexUrl, clerkPublishableKey, internalAllowedEmails, internalAllowedDomains };
}

function InternalAccessGate({
  convex,
  internalAllowedEmails,
  internalAllowedDomains,
}: {
  convex: ConvexReactClient;
  internalAllowedEmails: string[];
  internalAllowedDomains: string[];
}) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div style={{ padding: 24, color: "#EEEFF1" }}>Checking access...</div>;
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  const allowed = !!email && isEmailAllowed(email, internalAllowedEmails, internalAllowedDomains);

  if (!allowed) {
    return (
      <div style={{ maxWidth: 560, margin: "64px auto", padding: 24, background: "#1A1D21", border: "1px solid #2E3238", borderRadius: 12, color: "#EEEFF1" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Access restricted</h2>
        <p style={{ margin: 0, color: "#BFC4CC" }}>This is an internal app. Your account is not allowed.</p>
        <div style={{ marginTop: 16 }}>
          <SignOutButton>
            <button type="button" className="auth-btn">Use another account</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  );
}

const root = document.getElementById("root");
async function boot(): Promise<void> {
  if (!root) return;

  const { convexUrl, clerkPublishableKey, internalAllowedEmails, internalAllowedDomains } = await loadRuntimeConfig();
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
      <SignedOut>
        <div style={{ maxWidth: 460, margin: "40px auto" }}>
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <InternalAccessGate
          convex={convex}
          internalAllowedEmails={internalAllowedEmails}
          internalAllowedDomains={internalAllowedDomains}
        />
      </SignedIn>
    </ClerkProvider>,
  );
}

void boot().catch((error: unknown) => {
  console.error(error);
  if (root) {
    root.textContent = error instanceof Error ? error.message : "Failed to initialize app";
  }
});
