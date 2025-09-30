import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),
    type: v.optional(
      v.union(
        v.literal("proposal_generation"),
        v.literal("policy_checking"),
        v.literal("coverage_check"),
        v.literal("sov_builder"),
        v.literal("submission_intake"),
        v.literal("custom")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("workflows")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    if (args.clientId) {
      query = query.filter((q) => q.eq(q.field("clientId"), args.clientId));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    return await query.collect();
  },
});

export const get = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    name: v.string(),
    type: v.union(
      v.literal("proposal_generation"),
      v.literal("policy_checking"),
      v.literal("coverage_check"),
      v.literal("sov_builder"),
      v.literal("submission_intake"),
      v.literal("custom")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    isFavorite: v.boolean(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("workflows", {
      ...args,
      runs: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("workflows"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    isFavorite: v.optional(v.boolean()),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const incrementRuns = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.id);
    if (!workflow) throw new Error("Workflow not found");

    return await ctx.db.patch(args.id, {
      runs: workflow.runs + 1,
      lastRunAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});