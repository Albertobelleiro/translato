import { ClerkProvider, SignIn, SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { ConvexReactClient, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { api } from "../../convex/_generated/api";

import { installAuthDiagnostics, type AuthDiagnostic, getAuthCompatibilitySteps } from "./authDiagnostics.ts";
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
  __TRANSLATO_AUTH_DIAGNOSTICS_CLEANUP__?: (() => void) | null;
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

type AuthCompatibilityFallbackProps = {
  diagnostic: AuthDiagnostic;
};

function AuthCompatibilityFallback({ diagnostic }: AuthCompatibilityFallbackProps) {
  const steps = getAuthCompatibilitySteps();

  return (
    <div style={{ maxWidth: 700, margin: "64px auto", padding: 24, background: "#1A1D21", border: "1px solid #2E3238", borderRadius: 12, color: "#EEEFF1" }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Browser compatibility check required</h2>
      <p style={{ margin: 0, color: "#BFC4CC" }}>
        {diagnostic.message} The sign-in flow could not complete in this browser context.
      </p>
      <p style={{ marginTop: 12, marginBottom: 4, color: "#9CA3AF", fontSize: 12 }}>Error code: {diagnostic.code}</p>
      <p style={{ marginTop: 0, color: "#9CA3AF", fontSize: 12, wordBreak: "break-word" }}>{diagnostic.detail}</p>
      <ul style={{ marginTop: 12, marginBottom: 0, paddingLeft: 20, color: "#D1D5DB" }}>
        {steps.map((step) => (
          <li key={step} style={{ marginBottom: 6 }}>{step}</li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className="auth-btn"
          onClick={() => {
            if (typeof location !== "undefined") {
              location.reload();
            }
          }}
        >
          Retry sign-in
        </button>
      </div>
    </div>
  );
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

function renderAuthCompatibilityFallback(reactRoot: Root, diagnostic: AuthDiagnostic): void {
  reactRoot.render(<AuthCompatibilityFallback diagnostic={diagnostic} />);
}

function renderMainApp(reactRoot: Root, convexClient: ConvexReactClient, clerkPublishableKey: string, enableVercelAnalytics: boolean): void {
  reactRoot.render(
    <>
      {enableVercelAnalytics ? <Analytics /> : null}
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

function setupAuthDiagnostics(reactRoot: Root): void {
  const hmrGlobals = getHmrGlobals();
  hmrGlobals.__TRANSLATO_AUTH_DIAGNOSTICS_CLEANUP__?.();

  hmrGlobals.__TRANSLATO_AUTH_DIAGNOSTICS_CLEANUP__ = installAuthDiagnostics((diagnostic) => {
    console.error("Auth compatibility issue detected", diagnostic);
    renderAuthCompatibilityFallback(reactRoot, diagnostic);
  });
}

async function boot(): Promise<void> {
  const container = document.getElementById("root");
  if (!container) return;

  // Apply saved theme before rendering to prevent flash
  initTheme();

  const { convexUrl, clerkPublishableKey, enableVercelAnalytics } = await loadPublicRuntimeConfigAsync();
  const convexClient = getOrCreateConvexClient(convexUrl);
  const reactRoot = getOrCreateReactRoot(container);

  setupAuthDiagnostics(reactRoot);
  renderMainApp(reactRoot, convexClient, clerkPublishableKey, enableVercelAnalytics);
}

void boot().catch((error: unknown) => {
  console.error(error);
  const container = document.getElementById("root");
  if (container) {
    container.textContent = error instanceof Error ? error.message : "Failed to initialize app";
  }
});
