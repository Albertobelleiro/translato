import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("preferences")
      .withIndex("by_userId", (q) => q.eq("userId", user.id))
      .first();
  },
});

export const save = mutation({
  args: {
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_userId", (q) => q.eq("userId", user.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sourceLang: args.sourceLang,
        targetLang: args.targetLang,
      });
      return existing._id;
    }

    return await ctx.db.insert("preferences", {
      ...args,
      userId: user.id,
    });
  },
});
