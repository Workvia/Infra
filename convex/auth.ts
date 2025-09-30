import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from WorkOS session
export const getOrCreateUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Get or create default workspace
    let workspace = await ctx.db
      .query("workspaces")
      .first();

    if (!workspace) {
      workspace = {
        _id: await ctx.db.insert("workspaces", {
          name: "Default Workspace",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
        _creationTime: Date.now(),
        name: "Default Workspace",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      workspaceId: workspace._id,
      email: args.email,
      name: args.name,
      role: "admin",
      workosId: args.workosId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const newUser = await ctx.db.get(userId);
    return newUser;
  },
});

// Get user by WorkOS ID
export const getUserByWorkosId = query({
  args: {
    workosId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    return user;
  },
});

// Get current user's workspace
export const getCurrentUserWorkspace = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const workspace = await ctx.db.get(user.workspaceId);
    return workspace;
  },
});