import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./helpers";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export const record = mutation({
  args: {
    characterCount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const date = todayIso();
    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_userId_date", (q) => q.eq("userId", user.id).eq("date", date))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        translationCount: existing.translationCount + 1,
        characterCount: existing.characterCount + args.characterCount,
      });
      return existing._id;
    }

    return await ctx.db.insert("usageStats", {
      date,
      translationCount: 1,
      characterCount: args.characterCount,
      userId: user.id,
    });
  },
});

export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const date = todayIso();
    return await ctx.db
      .query("usageStats")
      .withIndex("by_userId_date", (q) => q.eq("userId", user.id).eq("date", date))
      .unique();
  },
});

export const getRange = query({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await ctx.db
      .query("usageStats")
      .withIndex("by_userId_date", (q) => q.eq("userId", user.id).gte("date", args.from).lte("date", args.to))
      .collect();
  },
});
