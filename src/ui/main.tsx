import { ClerkProvider, SignIn, SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { ConvexReactClient, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { api } from "../../convex/_generated/api";

import { App } from "./App.tsx";
import { initTheme } from "./hooks/useTheme.ts";
import { loadPublicRuntimeConfigAsync } from "./runtimeConfig.ts";
import "./styles/app.css";

if (import.meta.hot) {
  import.meta.hot.accept();
}

type ConvexRuntimeBoundaryProps = {
  children: ReactNode;
};

type ConvexRuntimeBoundaryState = {
  message: string | null;
};

type HmrGlobals = {
  __TRANSLATO_REACT_ROOT__?: Root;
  __TRANSLATO_REACT_CONTAINER__?: HTMLElement;
  __TRANSLATO_CONVEX_CLIENT__?: ConvexReactClient;
  __TRANSLATO_CONVEX_URL__?: string;
};

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

function getHmrGlobals(): typeof globalThis & HmrGlobals {
  return globalThis as typeof globalThis & HmrGlobals;
}

function getOrCreateReactRoot(container: HTMLElement): Root {
  const hmrGlobals = getHmrGlobals();
  if (!hmrGlobals.__TRANSLATO_REACT_ROOT__) {
    hmrGlobals.__TRANSLATO_REACT_ROOT__ = createRoot(container);
    hmrGlobals.__TRANSLATO_REACT_CONTAINER__ = container;
    return hmrGlobals.__TRANSLATO_REACT_ROOT__;
  }

  if (hmrGlobals.__TRANSLATO_REACT_CONTAINER__ !== container) {
    hmrGlobals.__TRANSLATO_REACT_ROOT__.unmount();
    hmrGlobals.__TRANSLATO_REACT_ROOT__ = createRoot(container);
    hmrGlobals.__TRANSLATO_REACT_CONTAINER__ = container;
  }

  return hmrGlobals.__TRANSLATO_REACT_ROOT__;
}

function getOrCreateConvexClient(convexUrl: string): ConvexReactClient {
  const hmrGlobals = getHmrGlobals();
  if (!hmrGlobals.__TRANSLATO_CONVEX_CLIENT__ || hmrGlobals.__TRANSLATO_CONVEX_URL__ !== convexUrl) {
    hmrGlobals.__TRANSLATO_CONVEX_CLIENT__ = new ConvexReactClient(convexUrl);
    hmrGlobals.__TRANSLATO_CONVEX_URL__ = convexUrl;
  }

  return hmrGlobals.__TRANSLATO_CONVEX_CLIENT__;
}

async function boot(): Promise<void> {
  const container = document.getElementById("root");
  if (!container) return;

  // Apply saved theme before rendering to prevent flash
  initTheme();

  const { convexUrl, clerkPublishableKey } = await loadPublicRuntimeConfigAsync();
  const convexClient = getOrCreateConvexClient(convexUrl);
  const reactRoot = getOrCreateReactRoot(container);

  reactRoot.render(
    <>
    <Analytics />
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
        <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
          <ConvexRuntimeBoundary>
            <InternalAccessGate />
          </ConvexRuntimeBoundary>
        </ConvexProviderWithClerk>
      </SignedIn>
    </ClerkProvider>
    </>,
  );
}

void boot().catch((error: unknown) => {
  console.error(error);
  const container = document.getElementById("root");
  if (container) {
    container.textContent = error instanceof Error ? error.message : "Failed to initialize app";
  }
});
