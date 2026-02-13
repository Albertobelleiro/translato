import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export const record = mutation({
  args: {
    characterCount: v.number(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const date = todayIso();
    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).eq("date", date))
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
      userId: args.userId,
    });
  },
});

export const getToday = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const date = todayIso();
    return await ctx.db
      .query("usageStats")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).eq("date", date))
      .unique();
  },
});

export const getRange = query({
  args: {
    from: v.string(),
    to: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("usageStats")
        .withIndex("by_userId_date", (q) => q.eq("userId", args.userId!).gte("date", args.from).lte("date", args.to))
        .collect();
    }

    return await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.gte("date", args.from).lte("date", args.to))
      .collect();
  },
});
