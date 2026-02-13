import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./helpers";

export const save = mutation({
  args: {
    sourceText: v.string(),
    targetText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
    detectedSourceLang: v.optional(v.string()),
    characterCount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("translations", {
      ...args,
      userId: user.id,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const rawLimit = args.limit ?? 50;
    const limit = Math.max(0, Math.min(Math.floor(rawLimit), 200));
    return await ctx.db
      .query("translations")
      .withIndex("by_userId", (q) => q.eq("userId", user.id))
      .order("desc")
      .take(limit);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("translations")
      .withIndex("by_userId", (q) => q.eq("userId", user.id))
      .collect();
    await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
    return { deleted: rows.length };
  },
});
