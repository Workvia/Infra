import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.clientId) {
      query = query.filter((q) => q.eq(q.field("clientId"), args.clientId));
    }

    return await query
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMessages = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    clientId: v.optional(v.id("clients")),
    title: v.optional(v.string()),
    sources: v.object({
      webSearch: v.boolean(),
      appsAndIntegrations: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("chatSessions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    citations: v.optional(
      v.array(
        v.object({
          documentId: v.optional(v.id("documents")),
          text: v.string(),
          sourceLocation: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update session's lastMessageAt
    await ctx.db.patch(args.sessionId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return await ctx.db.insert("chatMessages", {
      ...args,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("chatSessions"),
    title: v.optional(v.string()),
    sources: v.optional(
      v.object({
        webSearch: v.boolean(),
        appsAndIntegrations: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});