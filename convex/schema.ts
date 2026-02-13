import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  translations: defineTable({
    sourceText: v.string(),
    targetText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
    detectedSourceLang: v.optional(v.string()),
    characterCount: v.number(),
    createdAt: v.number(),
    userId: v.optional(v.string()),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId", "createdAt"]),
  preferences: defineTable({
    sourceLang: v.string(),
    targetLang: v.string(),
    userId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  usageStats: defineTable({
    date: v.string(),
    translationCount: v.number(),
    characterCount: v.number(),
    userId: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_userId_date", ["userId", "date"]),
});
