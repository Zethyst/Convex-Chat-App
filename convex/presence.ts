import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get current user's Convex ID from Clerk identity
async function getCurrentUserId(ctx: MutationCtx | QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return user?._id || null;
}

// Online threshold: users are considered online if they were active within the last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Updates the current user's lastSeen timestamp to indicate they are active
 */
export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return;

    await ctx.db.patch(userId, {
      lastSeen: Date.now(),
    });
  },
});

/**
 * Checks if a user is online based on their lastSeen timestamp
 */
export function isUserOnline(lastSeen: number | undefined): boolean {
  if (!lastSeen) return false;
  const now = Date.now();
  return now - lastSeen < ONLINE_THRESHOLD_MS;
}

/**
 * Gets the online status of a specific user by their ID
 */
export const getUserOnlineStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;
    return isUserOnline(user.lastSeen);
  },
});
