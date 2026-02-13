import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

function parseAllowList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isAllowedInternalEmail(email: string): boolean {
  const allowedEmails = parseAllowList(process.env.INTERNAL_ALLOWED_EMAILS);
  const allowedDomains = parseAllowList(process.env.INTERNAL_ALLOWED_DOMAINS);

  if (allowedEmails.size === 0 && allowedDomains.size === 0) return false;

  const normalized = email.toLowerCase();
  if (allowedEmails.has(normalized)) return true;

  const domain = normalized.split("@")[1] ?? "";
  return domain.length > 0 && allowedDomains.has(domain);
}

export async function getUser(ctx: AuthCtx): Promise<AuthUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const email = identity.email ?? undefined;
  if (!email || !isAllowedInternalEmail(email)) return null;

  return {
    id: identity.tokenIdentifier,
    email,
    name: identity.name ?? undefined,
  };
}

export async function requireUser(ctx: AuthCtx): Promise<AuthUser> {
  const user = await getUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}
