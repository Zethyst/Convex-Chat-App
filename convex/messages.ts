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

export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrNull(ctx);
    
    // If user doesn't exist yet, return empty array
    if (!userId) {
      console.log("[messages.list] User not found in database yet, returning empty list");
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(100);

    // Get reactions for each message
    const messagesWithReactions = await Promise.all(
      messages.reverse().map(async (msg) => {
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q: any) => q.eq("messageId", msg._id))
          .collect();

        // Group reactions by emoji
        const reactionMap = new Map<string, string[]>();
        for (const reaction of reactions) {
          const sender = await ctx.db.get(reaction.userId);
          if (!sender) continue;
          const clerkId = sender.clerkId;
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, []);
          }
          reactionMap.get(reaction.emoji)!.push(clerkId);
        }

        const reactionsArray = Array.from(reactionMap.entries()).map(
          ([emoji, userIds]) => ({ emoji, userIds })
        );

        return {
          id: msg._id,
          conversationId: msg.conversationId,
          senderId: (await ctx.db.get(msg.senderId))?.clerkId || "",
          content: msg.content,
          timestamp: msg.timestamp,
          isDeleted: msg.isDeleted,
          reactions: reactionsArray,
        };
      })
    );

    return messagesWithReactions;
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    if (!args.content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content.trim(),
      timestamp: Date.now(),
      isDeleted: false,
    });

    // Update conversation's last message
    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
      lastMessageTime: Date.now(),
    });

    // Increment unread count for other participants
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      for (const participantId of conversation.participantIds) {
        if (participantId !== userId) {
          const unread = await ctx.db
            .query("unreadCounts")
            .withIndex("by_conversation_and_user", (q: any) =>
              q.eq("conversationId", args.conversationId).eq("userId", participantId)
            )
            .unique();

          if (unread) {
            await ctx.db.patch(unread._id, { count: unread.count + 1 });
          } else {
            await ctx.db.insert("unreadCounts", {
              conversationId: args.conversationId,
              userId: participantId,
              count: 1,
            });
          }
        }
      }
    }

    // Return message with sender info
    const sender = await ctx.db.get(userId);
    return {
      id: messageId,
      conversationId: args.conversationId,
      senderId: sender?.clerkId || "",
      content: args.content.trim(),
      timestamp: Date.now(),
      isDeleted: false,
      reactions: [],
    };
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Check if reaction already exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_and_user", (q: any) =>
        q.eq("messageId", args.messageId).eq("userId", userId).eq("emoji", args.emoji)
      )
      .unique();

    if (existing) {
      // Remove reaction if it exists (toggle)
      await ctx.db.delete(existing._id);
    } else {
      // Add reaction
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId,
        emoji: args.emoji,
      });
    }
  },
});
