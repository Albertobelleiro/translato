export type AuthDiagnostic = {
  code: "failed_to_load_clerk_js" | "failed_to_load_clerk_js_timeout" | "csp_worker_blocked" | "unknown_auth_error";
  message: string;
  detail: string;
};

type EventTargetLike = {
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
};

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "object" && value) return JSON.stringify(value);
  return String(value ?? "");
}

function parseClerkError(text: string): AuthDiagnostic | null {
  if (text.includes("failed_to_load_clerk_js_timeout")) {
    return {
      code: "failed_to_load_clerk_js_timeout",
      message: "Clerk timed out while loading.",
      detail: text,
    };
  }

  if (text.includes("failed_to_load_clerk_js")) {
    return {
      code: "failed_to_load_clerk_js",
      message: "Clerk script could not be loaded.",
      detail: text,
    };
  }

  return null;
}

function parseCspWorkerError(text: string): AuthDiagnostic | null {
  const hasWorkerSignal = text.includes("worker-src")
    || text.includes("blob:")
    || text.includes("Creating a worker");
  const hasPolicySignal = text.includes("Content Security Policy")
    || text.includes("script-src")
    || text.includes("securitypolicyviolation");

  if (!(hasWorkerSignal && hasPolicySignal)) {
    return null;
  }

  return {
    code: "csp_worker_blocked",
    message: "Browser blocked Clerk worker due to security settings.",
    detail: text,
  };
}

function detectDiagnostic(raw: unknown): AuthDiagnostic | null {
  const text = toText(raw);
  return parseClerkError(text) ?? parseCspWorkerError(text);
}

export function getAuthCompatibilitySteps(): string[] {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  const steps = [
    "Hard refresh the page (Cmd/Ctrl + Shift + R).",
    "Disable privacy/ad-block extensions for this site and retry.",
    "Clear site data (cookies + cache) for translato.ai-wave.co and retry.",
  ];

  if (userAgent.includes("brave")) {
    steps.unshift("In Brave Shields, allow scripts and third-party cookies for this site.");
  } else if (userAgent.includes("firefox")) {
    steps.unshift("In Firefox Enhanced Tracking Protection, disable strict blocking for this site.");
  } else if (userAgent.includes("safari")) {
    steps.unshift("In Safari, disable content blockers for this site and retry.");
  }

  return steps;
}

export function installAuthDiagnostics(onDiagnostic: (diagnostic: AuthDiagnostic) => void): () => void {
  const target = globalThis as unknown as EventTargetLike;
  if (!target.addEventListener || !target.removeEventListener) {
    return () => undefined;
  }

  let reported = false;
  const report = (diagnostic: AuthDiagnostic) => {
    if (reported) return;
    reported = true;
    onDiagnostic(diagnostic);
  };

  const onError: EventListener = (event) => {
    const errorEvent = event as ErrorEvent;
    const diagnostic = detectDiagnostic(errorEvent.error ?? errorEvent.message);
    if (diagnostic) report(diagnostic);
  };

  const onUnhandledRejection: EventListener = (event) => {
    const rejectionEvent = event as PromiseRejectionEvent;
    const diagnostic = detectDiagnostic(rejectionEvent.reason);
    if (diagnostic) report(diagnostic);
  };

  const onSecurityPolicyViolation: EventListener = (event) => {
    const cspEvent = event as SecurityPolicyViolationEvent;
    const diagnostic = parseCspWorkerError(
      `${cspEvent.violatedDirective ?? ""} ${cspEvent.blockedURI ?? ""} ${cspEvent.originalPolicy ?? ""}`,
    );
    if (diagnostic) report(diagnostic);
  };

  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onUnhandledRejection);
  target.addEventListener("securitypolicyviolation", onSecurityPolicyViolation);

  return () => {
    target.removeEventListener?.("error", onError);
    target.removeEventListener?.("unhandledrejection", onUnhandledRejection);
    target.removeEventListener?.("securitypolicyviolation", onSecurityPolicyViolation);
  };
}
