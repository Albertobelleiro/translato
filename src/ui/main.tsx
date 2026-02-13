import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { App } from "./App.tsx";
import "./styles/app.css";

const convexUrl = import.meta.env.CONVEX_URL as string | undefined;
const clerkPublishableKey =
  (import.meta.env.CLERK_PUBLISHABLE_KEY as string | undefined)
  ?? (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined);

if (!convexUrl) throw new Error("Missing CONVEX_URL. Run `bunx convex dev` to configure it.");
if (!clerkPublishableKey) throw new Error("Missing CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY) in .env");

const convex = new ConvexReactClient(convexUrl);

const root = document.getElementById("root");
if (root) {
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
