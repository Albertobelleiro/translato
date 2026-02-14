import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
type MockRoot = {
  render: ReturnType<typeof mock>;
  unmount: ReturnType<typeof mock>;
};

type Harness = {
  createRootMock: ReturnType<typeof mock>;
  convexCtorMock: ReturnType<typeof mock>;
  initThemeMock: ReturnType<typeof mock>;
  locationReloadMock: ReturnType<typeof mock>;
  roots: MockRoot[];
  components: {
    Analytics: () => unknown;
    ClerkProvider: (props: { children?: unknown }) => unknown;
    SignedIn: (props: { children?: unknown }) => unknown;
    SignedOut: (props: { children?: unknown }) => unknown;
    ConvexProviderWithClerk: (props: { children?: unknown }) => unknown;
  };
  getListenerCount: (type: string) => number;
  setContainer: (container: HTMLElement & { textContent: string }) => void;
  getContainer: () => HTMLElement & { textContent: string };
  getRenderedTree: () => unknown;
};

const HMR_ROOT_KEY = "__TRANSLATO_REACT_ROOT__";
const HMR_CONTAINER_KEY = "__TRANSLATO_REACT_CONTAINER__";
const HMR_CONVEX_CLIENT_KEY = "__TRANSLATO_CONVEX_CLIENT__";
const HMR_CONVEX_URL_KEY = "__TRANSLATO_CONVEX_URL__";
const HMR_DIAGNOSTICS_CLEANUP_KEY = "__TRANSLATO_AUTH_DIAGNOSTICS_CLEANUP__";

const loadMain = () => import(`../../src/ui/main.tsx?test=${crypto.randomUUID()}`);

function createContainer(id = "root"): HTMLElement & { textContent: string } {
  return { id, textContent: "" } as unknown as HTMLElement & { textContent: string };
}

function clearHmrGlobals(): void {
  delete (globalThis as Record<string, unknown>)[HMR_ROOT_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONTAINER_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONVEX_CLIENT_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONVEX_URL_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_DIAGNOSTICS_CLEANUP_KEY];
}

function countElementsByType(node: unknown, targetType: unknown): number {
  if (!node || typeof node !== "object") return 0;

  const element = node as { type?: unknown; props?: { children?: unknown } };
  let count = element.type === targetType ? 1 : 0;
  const children = element.props?.children;

  if (Array.isArray(children)) {
    for (const child of children) {
      count += countElementsByType(child, targetType);
    }
    return count;
  }

  return count + countElementsByType(children, targetType);
}

function findElementByType(node: unknown, targetType: unknown): { props?: Record<string, unknown> } | null {
  if (!node || typeof node !== "object") return null;

  const element = node as { type?: unknown; props?: { children?: unknown } & Record<string, unknown> };
  if (element.type === targetType) {
    return { props: element.props };
  }

  const children = element.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findElementByType(child, targetType);
      if (found) return found;
    }
    return null;
  }

  return findElementByType(children, targetType);
}

function treeIncludesText(node: unknown, text: string): boolean {
  if (typeof node === "string") return node.includes(text);
  if (!node || typeof node !== "object") return false;

  const element = node as { props?: { children?: unknown } };
  const children = element.props?.children;
  if (Array.isArray(children)) {
    return children.some((child) => treeIncludesText(child, text));
  }

  return treeIncludesText(children, text);
}

function findFirstButtonProps(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;

  const element = node as { type?: unknown; props?: Record<string, unknown> & { children?: unknown } };
  if (element.type === "button") {
    return element.props ?? null;
  }

  const children = element.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findFirstButtonProps(child);
      if (found) return found;
    }
    return null;
  }

  return findFirstButtonProps(children);
}

async function flushBoot(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function setupHarness(options: { convexUrl?: string; clerkPublishableKey?: string; enableVercelAnalytics?: string } = {}): Harness {
  clearHmrGlobals();
  process.env.VITE_CONVEX_URL = options.convexUrl ?? "https://dev.convex.cloud";
  process.env.VITE_CLERK_PUBLISHABLE_KEY = options.clerkPublishableKey ?? "pk_test_default";
  process.env.VITE_ENABLE_VERCEL_ANALYTICS = options.enableVercelAnalytics ?? "false";
  spyOn(console, "error").mockImplementation(() => undefined as never);

  let currentContainer = createContainer();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      getElementById: mock((id: string) => (id === "root" ? currentContainer : null)),
    },
  });

  const locationReloadMock = mock(() => undefined);
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    writable: true,
    value: {
      reload: locationReloadMock,
    },
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

  const createRootMock = mock((_: HTMLElement) => {
    const root: MockRoot = {
      render: mock(() => undefined),
      unmount: mock(() => undefined),
    };
    roots.push(root);
    return root;
  });

  const roots: MockRoot[] = [];

  const convexCtorMock = mock((_: string) => undefined);
  class ConvexReactClientMock {
    constructor(url: string) {
      convexCtorMock(url);
    }
  }

  const Analytics = () => null;
  const ClerkProvider = (props: { children?: unknown }) => props.children ?? null;
  const SignedIn = (props: { children?: unknown }) => props.children ?? null;
  const SignedOut = (props: { children?: unknown }) => props.children ?? null;
  const ConvexProviderWithClerk = (props: { children?: unknown }) => props.children ?? null;

  const initThemeMock = mock(() => undefined);

  mock.module("react-dom/client", () => ({ createRoot: createRootMock }));
  mock.module("../../src/ui/styles/app.css", () => ({}));
  mock.module("../../src/ui/App.tsx", () => ({ App: () => null }));
  mock.module("../../src/ui/hooks/useTheme.ts", () => ({ initTheme: initThemeMock }));
  mock.module("../../convex/_generated/api", () => ({ api: { preferences: { viewer: "preferences:viewer" } } }));
  mock.module("@vercel/analytics/react", () => ({ Analytics }));
  mock.module("@clerk/clerk-react", () => ({
    ClerkProvider,
    SignIn: () => null,
    SignOutButton: (props: { children?: unknown }) => props.children ?? null,
    SignedIn,
    SignedOut,
    useAuth: () => ({}),
    useUser: () => ({ isLoaded: true }),
  }));
  mock.module("convex/react", () => ({
    ConvexReactClient: ConvexReactClientMock,
    useQuery: () => null,
  }));
  mock.module("convex/react-clerk", () => ({ ConvexProviderWithClerk }));
  return {
    createRootMock,
    convexCtorMock,
    initThemeMock,
    locationReloadMock,
    roots,
    components: {
      Analytics,
      ClerkProvider,
      SignedIn,
      SignedOut,
      ConvexProviderWithClerk,
    },
    getListenerCount: (type) => listeners.get(type)?.size ?? 0,
    setContainer: (container) => {
      currentContainer = container;
    },
    getContainer: () => currentContainer,
    getRenderedTree: () => roots[0]?.render.mock.calls.at(-1)?.[0],
  };
}

beforeEach(() => {
  mock.restore();
  clearHmrGlobals();
});

afterEach(() => {
  mock.restore();
  clearHmrGlobals();
});

describe("Unit - ui/main bootstrap", () => {
  test("renders exactly one ClerkProvider", async () => {
    const harness = setupHarness();
    await loadMain();
    await flushBoot();

    const tree = harness.getRenderedTree();
    expect(countElementsByType(tree, harness.components.ClerkProvider)).toBe(1);
    expect(harness.createRootMock).toHaveBeenCalledTimes(1);
  });

  test("passes runtime publishable key into ClerkProvider", async () => {
    const harness = setupHarness({
      clerkPublishableKey: "pk_test_runtime_key",
    });
    await loadMain();
    await flushBoot();

    const tree = harness.getRenderedTree();
    const clerkNode = findElementByType(tree, harness.components.ClerkProvider);
    expect(clerkNode?.props?.publishableKey).toBe("pk_test_runtime_key");
    expect(harness.initThemeMock).toHaveBeenCalledTimes(1);
  });

  test("renders Analytics only when enabled", async () => {
    const disabledHarness = setupHarness({ enableVercelAnalytics: "false" });
    await loadMain();
    await flushBoot();
    expect(countElementsByType(disabledHarness.getRenderedTree(), disabledHarness.components.Analytics)).toBe(0);

    const enabledHarness = setupHarness({ enableVercelAnalytics: "true" });
    await loadMain();
    await flushBoot();
    expect(countElementsByType(enabledHarness.getRenderedTree(), enabledHarness.components.Analytics)).toBe(1);
  });
});

describe("Integration - HMR singleton behavior", () => {
  test("reuses React root and Convex client across hot reload imports", async () => {
    const harness = setupHarness({
      convexUrl: "https://dev.convex.cloud",
      clerkPublishableKey: "pk_test_1",
    });

    await loadMain();
    await flushBoot();
    await loadMain();
    await flushBoot();

    expect(harness.createRootMock).toHaveBeenCalledTimes(1);
    expect(harness.roots[0]?.render).toHaveBeenCalledTimes(2);
    expect(harness.convexCtorMock).toHaveBeenCalledTimes(1);
  });

  test("creates a new Convex client when runtime Convex URL changes", async () => {
    const harness = setupHarness({
      convexUrl: "https://dev-a.convex.cloud",
      clerkPublishableKey: "pk_test_1",
    });

    await loadMain();
    await flushBoot();
    process.env.VITE_CONVEX_URL = "https://dev-b.convex.cloud";
    await loadMain();
    await flushBoot();

    expect(harness.createRootMock).toHaveBeenCalledTimes(1);
    expect(harness.convexCtorMock).toHaveBeenCalledTimes(2);
  });

  test("recreates root if #root container instance changes", async () => {
    const harness = setupHarness();

    await loadMain();
    await flushBoot();

    const firstRoot = harness.roots[0];
    harness.setContainer(createContainer("root"));

    await loadMain();
    await flushBoot();

    expect(harness.createRootMock).toHaveBeenCalledTimes(2);
    expect(firstRoot?.unmount).toHaveBeenCalledTimes(1);
    expect(harness.roots[1]?.render).toHaveBeenCalledTimes(1);
  });
});

describe("E2E - full boot flow", () => {
  test("renders signed-in/signed-out branches under one ClerkProvider", async () => {
    const harness = setupHarness();

    await loadMain();
    await flushBoot();

    const tree = harness.getRenderedTree();
    expect(countElementsByType(tree, harness.components.ClerkProvider)).toBe(1);
    expect(countElementsByType(tree, harness.components.SignedIn)).toBe(1);
    expect(countElementsByType(tree, harness.components.SignedOut)).toBe(1);
    expect(countElementsByType(tree, harness.components.ConvexProviderWithClerk)).toBe(1);
  });

  test("installs auth diagnostics listeners during boot", async () => {
    const harness = setupHarness();

    await loadMain();
    await flushBoot();

    expect(harness.getListenerCount("error")).toBe(1);
    expect(harness.getListenerCount("unhandledrejection")).toBe(1);
    expect(harness.getListenerCount("securitypolicyviolation")).toBe(1);
  });

  test("writes readable boot error to root container when runtime config fails", async () => {
    const harness = setupHarness();
    delete process.env.VITE_CONVEX_URL;

    await loadMain();
    await flushBoot();

    expect(harness.createRootMock).not.toHaveBeenCalled();
    expect(harness.getContainer().textContent).toContain("Missing VITE_CONVEX_URL");
  });
});
