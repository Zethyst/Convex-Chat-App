import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get current user's Convex ID from Clerk identity (for queries - returns null if not found)
async function getCurrentUserIdOrNull(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return user?._id || null;
}

// Helper to get current user's Convex ID from Clerk identity (for mutations - auto-creates if missing)
async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  // If user doesn't exist, create them (handles race condition)
  if (!user) {
    const clerkId = identity.subject;
    const name = typeof identity.name === "string" ? identity.name : "Unknown";
    const email = typeof identity.email === "string" ? identity.email : "";
    const imageUrl = typeof identity.picture === "string" ? identity.picture : undefined;

    const userId = await ctx.db.insert("users", {
      clerkId,
      name,
      email,
      imageUrl,
    });
    return userId;
  }

  return user._id;
}

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_and_user", (q: any) =>
        q.eq("conversationId", args.conversationId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      if (args.isTyping) {
        await ctx.db.patch(existing._id, {
          isTyping: true,
          lastUpdated: Date.now(),
        });
      } else {
        await ctx.db.delete(existing._id);
      }
    } else if (args.isTyping) {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId,
        isTyping: true,
        lastUpdated: Date.now(),
      });
    }

    // Clean up old typing indicators (older than 5 seconds)
    const allTyping = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const fiveSecondsAgo = Date.now() - 5000;
    for (const indicator of allTyping) {
      if (indicator.lastUpdated < fiveSecondsAgo) {
        await ctx.db.delete(indicator._id);
      }
    }
  },
});

export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrNull(ctx);
    
    // If user doesn't exist yet, return empty array
    if (!userId) {
      return [];
    }

    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Filter out expired indicators
    const fiveSecondsAgo = Date.now() - 5000;
    const activeIndicators = indicators.filter(
      (ind) => ind.lastUpdated > fiveSecondsAgo && ind.isTyping
    );

    // Get user info for each indicator
    const enriched = await Promise.all(
      activeIndicators.map(async (ind) => {
        const user = await ctx.db.get(ind.userId);
        return {
          userId: user?.clerkId || "",
          conversationId: args.conversationId,
          isTyping: ind.isTyping,
        };
      })
    );

    return enriched;
  },
});
