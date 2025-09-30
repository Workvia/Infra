import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("clients")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query.collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    domain: v.optional(v.string()),
    description: v.optional(v.string()),
    team: v.optional(v.string()),
    categories: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clients", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    domain: v.optional(v.string()),
    description: v.optional(v.string()),
    team: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});