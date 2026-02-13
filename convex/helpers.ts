import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

export async function getUser(ctx: AuthCtx): Promise<AuthUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return {
    id: identity.tokenIdentifier,
    email: identity.email ?? undefined,
    name: identity.name ?? undefined,
  };
}

export async function requireUser(ctx: AuthCtx): Promise<AuthUser> {
  const user = await getUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}
