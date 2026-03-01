import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { isUserOnline } from "./presence";

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
        lastSeen: Date.now(), // Set initial lastSeen when user is created
      });
      return userId;
    }

  return user._id;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrNull(ctx);
    
    // If user doesn't exist yet, return empty array (ConvexUserSync will create them soon)
    if (!userId) {
      console.log("[conversations.list] User not found in database yet, returning empty list");
      return [];
    }

    // Get all conversations and filter where user is a participant
    const allConversations = await ctx.db.query("conversations").collect();
    const userConversations = allConversations.filter((conv) =>
      conv.participantIds.includes(userId)
    );

    // Enrich with participant info and last message
    const enriched = await Promise.all(
      userConversations.map(async (conv) => {
        // Get the other participant (assuming 1-on-1 chats)
        const otherParticipantId = conv.participantIds.find((id) => id !== userId);
        if (!otherParticipantId) return null;

        const otherParticipant = await ctx.db.get(otherParticipantId);
        if (!otherParticipant) return null;

        // Get last message
        let lastMessage = null;
        if (conv.lastMessageId) {
          lastMessage = await ctx.db.get(conv.lastMessageId);
        }

        // Get unread count
        const unread = await ctx.db
          .query("unreadCounts")
          .withIndex("by_conversation_and_user", (q: any) =>
            q.eq("conversationId", conv._id).eq("userId", userId)
          )
          .unique();

        return {
          id: conv._id as string,
          participantIds: conv.participantIds.map((id) => id as string),
          participantName: otherParticipant.name,
          participantAvatar: otherParticipant.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherParticipant.name)}`,
          participantOnline: isUserOnline(otherParticipant.lastSeen),
          lastMessage: lastMessage?.content || "",
          lastMessageTime: conv.lastMessageTime,
          unreadCount: unread?.count || 0,
        };
      })
    );

    return enriched.filter((conv) => conv !== null);
  },
});

export const create = mutation({
  args: {
    otherParticipantClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Find other participant by Clerk ID
    const otherParticipant = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.otherParticipantClerkId))
      .unique();

    if (!otherParticipant) throw new Error("Participant not found");

    // Check if conversation already exists
    // Note: Can't use index on array field to query by single participant
    // So we query all and filter
    const allConversations = await ctx.db.query("conversations").collect();
    const existingConv = allConversations.find(
      (conv) =>
        conv.participantIds.includes(userId) &&
        conv.participantIds.includes(otherParticipant._id)
    );

    if (existingConv) return existingConv._id;

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      participantIds: [userId, otherParticipant._id],
      lastMessageTime: Date.now(),
    });

    // Initialize unread counts
    await ctx.db.insert("unreadCounts", {
      conversationId,
      userId,
      count: 0,
    });
    await ctx.db.insert("unreadCounts", {
      conversationId,
      userId: otherParticipant._id,
      count: 0,
    });

    return conversationId;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const unread = await ctx.db
      .query("unreadCounts")
      .withIndex("by_conversation_and_user", (q: any) =>
        q.eq("conversationId", args.conversationId).eq("userId", userId)
      )
      .unique();

    if (unread) {
      await ctx.db.patch(unread._id, { count: 0 });
    }
  },
});
