import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

type RuntimeConfig = {
  convexUrl: string;
  clerkPublishableKey: string;
};

type MockRoot = {
  render: ReturnType<typeof mock>;
  unmount: ReturnType<typeof mock>;
};

type Harness = {
  createRootMock: ReturnType<typeof mock>;
  convexCtorMock: ReturnType<typeof mock>;
  initThemeMock: ReturnType<typeof mock>;
  fetchSpy: ReturnType<typeof spyOn>;
  roots: MockRoot[];
  components: {
    ClerkProvider: (props: { children?: unknown }) => unknown;
    SignedIn: (props: { children?: unknown }) => unknown;
    SignedOut: (props: { children?: unknown }) => unknown;
    ConvexProviderWithClerk: (props: { children?: unknown }) => unknown;
  };
  setContainer: (container: HTMLElement & { textContent: string }) => void;
  getContainer: () => HTMLElement & { textContent: string };
  getRenderedTree: () => unknown;
};

const HMR_ROOT_KEY = "__TRANSLATO_REACT_ROOT__";
const HMR_CONTAINER_KEY = "__TRANSLATO_REACT_CONTAINER__";
const HMR_CONVEX_CLIENT_KEY = "__TRANSLATO_CONVEX_CLIENT__";
const HMR_CONVEX_URL_KEY = "__TRANSLATO_CONVEX_URL__";

const defaultConfig: RuntimeConfig = {
  convexUrl: "https://dev.convex.cloud",
  clerkPublishableKey: "pk_test_default",
};

const loadMain = () => import(`../../src/ui/main.tsx?test=${crypto.randomUUID()}`);

function createContainer(id = "root"): HTMLElement & { textContent: string } {
  return { id, textContent: "" } as unknown as HTMLElement & { textContent: string };
}

function clearHmrGlobals(): void {
  delete (globalThis as Record<string, unknown>)[HMR_ROOT_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONTAINER_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONVEX_CLIENT_KEY];
  delete (globalThis as Record<string, unknown>)[HMR_CONVEX_URL_KEY];
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

async function flushBoot(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function setupHarness(options: { configs?: RuntimeConfig[]; fetchError?: Error } = {}): Harness {
  clearHmrGlobals();
  delete process.env.CONVEX_URL;
  delete process.env.CLERK_PUBLISHABLE_KEY;
  delete process.env.VITE_CLERK_PUBLISHABLE_KEY;
  spyOn(console, "error").mockImplementation(() => undefined as never);

  let currentContainer = createContainer();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      getElementById: mock((id: string) => (id === "root" ? currentContainer : null)),
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
  mock.module("@vercel/analytics/react", () => ({ Analytics: () => null }));
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

  const fetchSpy = spyOn(globalThis, "fetch");
  if (options.fetchError) {
    fetchSpy.mockRejectedValue(options.fetchError);
  } else {
    const queue = options.configs && options.configs.length > 0 ? [...options.configs] : [defaultConfig];
    const fallback = queue[queue.length - 1] ?? defaultConfig;
    fetchSpy.mockImplementation((async () => {
      const payload = queue.shift() ?? fallback;
      return new Response(JSON.stringify(payload), { status: 200 });
    }) as never);
  }

  return {
    createRootMock,
    convexCtorMock,
    initThemeMock,
    fetchSpy,
    roots,
    components: {
      ClerkProvider,
      SignedIn,
      SignedOut,
      ConvexProviderWithClerk,
    },
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
      configs: [{ convexUrl: "https://dev.convex.cloud", clerkPublishableKey: "pk_test_runtime_key" }],
    });
    await loadMain();
    await flushBoot();

    const tree = harness.getRenderedTree();
    const clerkNode = findElementByType(tree, harness.components.ClerkProvider);
    expect(clerkNode?.props?.publishableKey).toBe("pk_test_runtime_key");
    expect(harness.initThemeMock).toHaveBeenCalledTimes(1);
  });
});

describe("Integration - HMR singleton behavior", () => {
  test("reuses React root and Convex client across hot reload imports", async () => {
    const harness = setupHarness({
      configs: [
        { convexUrl: "https://dev.convex.cloud", clerkPublishableKey: "pk_test_1" },
        { convexUrl: "https://dev.convex.cloud", clerkPublishableKey: "pk_test_1" },
      ],
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
      configs: [
        { convexUrl: "https://dev-a.convex.cloud", clerkPublishableKey: "pk_test_1" },
        { convexUrl: "https://dev-b.convex.cloud", clerkPublishableKey: "pk_test_1" },
      ],
    });

    await loadMain();
    await flushBoot();
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

  test("writes readable boot error to root container when runtime config fails", async () => {
    const harness = setupHarness({ fetchError: new Error("network down") });

    await loadMain();
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(harness.createRootMock).not.toHaveBeenCalled();
    expect(harness.getContainer().textContent).toContain("Unable to load runtime config");
    expect(harness.fetchSpy).toHaveBeenCalledTimes(2);
  });
});
