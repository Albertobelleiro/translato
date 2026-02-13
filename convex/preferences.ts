import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("preferences").first();
  },
});

export const save = mutation({
  args: {
    sourceLang: v.string(),
    targetLang: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sourceLang: args.sourceLang,
        targetLang: args.targetLang,
      });
      return existing._id;
    }

    return await ctx.db.insert("preferences", args);
  },
});
