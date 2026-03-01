import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[getOrCreate] Mutation called");
    
    const identity = await ctx.auth.getUserIdentity();
    console.log("[getOrCreate] Identity received:", {
      hasIdentity: !!identity,
      identity: identity ? {
        subject: identity.subject,
        name: identity.name,
        email: identity.email,
        picture: identity.picture,
        // Log all identity fields
        allFields: Object.keys(identity),
      } : null,
    });

    if (!identity) {
      console.error("[getOrCreate] ❌ No identity - user not authenticated");
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;
    const name = typeof identity.name === "string" ? identity.name : "Unknown";
    const email = typeof identity.email === "string" ? identity.email : "";
    const imageUrl = typeof identity.picture === "string" ? identity.picture : undefined;

    console.log("[getOrCreate] Processing user:", {
      clerkId,
      name,
      email,
      imageUrl,
    });

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
      .unique();

    console.log("[getOrCreate] Existing user check:", {
      found: !!existing,
      userId: existing?._id,
    });

    if (existing) {
      console.log("[getOrCreate] Updating existing user:", existing._id);
      await ctx.db.patch(existing._id, { 
        name, 
        email, 
        imageUrl,
        lastSeen: Date.now(), // Update lastSeen when user logs in
      });
      console.log("[getOrCreate] ✅ User updated successfully");
      return existing._id;
    }

    console.log("[getOrCreate] Creating new user...");
    const userId = await ctx.db.insert("users", {
      clerkId,
      name,
      email,
      imageUrl,
      lastSeen: Date.now(), // Set initial lastSeen when user is created
    });
    console.log("[getOrCreate] ✅ New user created:", userId);
    return userId;
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Get all users (for user picker)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    }));
  },
});

// Debug query to check current auth identity
export const getCurrentIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("[getCurrentIdentity] Current identity:", {
      hasIdentity: !!identity,
      identity: identity ? {
        subject: identity.subject,
        name: identity.name,
        email: identity.email,
        picture: identity.picture,
        allFields: Object.keys(identity),
      } : null,
    });
    return identity;
  },
});
