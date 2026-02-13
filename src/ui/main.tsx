import { ClerkProvider, SignIn, SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { ConvexReactClient, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { api } from "../../convex/_generated/api";

import { App } from "./App.tsx";
import "./styles/app.css";

if (import.meta.hot) {
  import.meta.hot.accept();
}

type RuntimeConfig = {
  convexUrl?: string;
  clerkPublishableKey?: string;
};

type LoadedRuntimeConfig = {
  convexUrl: string;
  clerkPublishableKey: string;
};

type ConvexRuntimeBoundaryProps = {
  children: ReactNode;
};

type ConvexRuntimeBoundaryState = {
  message: string | null;
};

const clientEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

class ConvexRuntimeBoundary extends Component<ConvexRuntimeBoundaryProps, ConvexRuntimeBoundaryState> {
  override state: ConvexRuntimeBoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): ConvexRuntimeBoundaryState {
    if (error instanceof Error && error.message.includes("Could not find public function for 'preferences:viewer'")) {
      return { message: "Convex functions are out of sync. Run `bunx convex dev --once` and refresh." };
    }
    return { message: "Unexpected app error." };
  }

  override componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error(error, errorInfo);
  }

  override render() {
    if (!this.state.message) return this.props.children;

    return (
      <div style={{ maxWidth: 560, margin: "64px auto", padding: 24, background: "#1A1D21", border: "1px solid #2E3238", borderRadius: 12, color: "#EEEFF1" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Configuration required</h2>
        <p style={{ margin: 0, color: "#BFC4CC" }}>{this.state.message}</p>
      </div>
    );
  }
}

async function loadRuntimeConfig(): Promise<LoadedRuntimeConfig> {
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

function InternalAccessGate() {
  const { isLoaded } = useUser();
  const user = useQuery(api.preferences.viewer, isLoaded ? {} : "skip");

  if (!isLoaded) {
    return <div style={{ padding: 24, color: "#EEEFF1" }}>Checking access...</div>;
  }

  if (user === undefined) {
    return <div style={{ padding: 24, color: "#EEEFF1" }}>Checking access...</div>;
  }

  if (!user) {
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

  return <App />;
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
      <SignedOut>
        <div style={{ maxWidth: 460, margin: "40px auto" }}>
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ConvexRuntimeBoundary>
            <InternalAccessGate />
          </ConvexRuntimeBoundary>
        </ConvexProviderWithClerk>
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
