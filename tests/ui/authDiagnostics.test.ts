import { beforeEach, describe, expect, test } from "bun:test";
import type { AuthDiagnostic } from "../../src/ui/authDiagnostics.ts";

const loadModule = () => import(`../../src/ui/authDiagnostics.ts?test=${crypto.randomUUID()}`);

beforeEach(() => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: { userAgent: "Mozilla/5.0" },
  });

  const listeners = new Map<string, Set<EventListener>>();
  Object.defineProperty(globalThis, "addEventListener", {
    configurable: true,
    writable: true,
    value: (type: string, listener: EventListener) => {
      const bucket = listeners.get(type) ?? new Set<EventListener>();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
  });
  Object.defineProperty(globalThis, "removeEventListener", {
    configurable: true,
    writable: true,
    value: (type: string, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    },
  });
  Object.defineProperty(globalThis, "dispatchEvent", {
    configurable: true,
    writable: true,
    value: (event: Event) => {
      const bucket = listeners.get(event.type);
      if (!bucket) return true;
      for (const listener of bucket) {
        listener(event);
      }
      return true;
    },
  });
});

describe("authDiagnostics", () => {
  test("reports Clerk script load failures from unhandled rejections", async () => {
    const { installAuthDiagnostics } = await loadModule();
    let captured: AuthDiagnostic["code"] | undefined;

    const cleanup = installAuthDiagnostics((diagnostic: AuthDiagnostic) => {
      captured = diagnostic.code;
    });

    const event = new Event("unhandledrejection") as Event & { reason: string };
    Object.defineProperty(event, "reason", { value: "failed_to_load_clerk_js" });
    globalThis.dispatchEvent(event);

    expect(captured).toBe("failed_to_load_clerk_js");
    cleanup();
  });

  test("reports CSP worker violations", async () => {
    const { installAuthDiagnostics } = await loadModule();
    let captured: AuthDiagnostic["code"] | undefined;

    const cleanup = installAuthDiagnostics((diagnostic: AuthDiagnostic) => {
      captured = diagnostic.code;
    });

    const event = new Event("securitypolicyviolation") as Event & {
      blockedURI: string;
      violatedDirective: string;
      originalPolicy: string;
    };
    Object.defineProperty(event, "blockedURI", { value: "blob:https://translato.ai-wave.co/123" });
    Object.defineProperty(event, "violatedDirective", { value: "script-src" });
    Object.defineProperty(event, "originalPolicy", { value: "script-src 'self'" });
    globalThis.dispatchEvent(event);

    expect(captured).toBe("csp_worker_blocked");
    cleanup();
  });

  test("returns browser-specific guidance for Brave", async () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      writable: true,
      value: { userAgent: "Mozilla/5.0 Brave/1.75.1" },
    });
    const { getAuthCompatibilitySteps } = await loadModule();
    const steps = getAuthCompatibilitySteps();

    expect(steps[0]).toContain("Brave Shields");
  });
});
