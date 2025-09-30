import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User and workspace management
  workspaces: defineTable({
    name: v.string(),
    domain: v.optional(v.string()),
    settings: v.optional(v.object({
      branding: v.optional(v.object({
        logo: v.optional(v.string()),
        accentColor: v.optional(v.string()),
      })),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_domain", ["domain"]),

  users: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    workosId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_workos_id", ["workosId"]),

  // Client management
  clients: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    domain: v.optional(v.string()),
    description: v.optional(v.string()),
    team: v.optional(v.string()),
    categories: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    metadata: v.optional(v.any()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["workspaceId", "status"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["workspaceId"],
    }),

  // Document management
  documents: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    name: v.string(),
    type: v.union(
      v.literal("carrier_quote"),
      v.literal("binded_policy"),
      v.literal("dec_page"),
      v.literal("email"),
      v.literal("amendment"),
      v.literal("other")
    ),
    storageId: v.optional(v.string()), // Convex storage ID or S3 key
    storageProvider: v.union(v.literal("convex"), v.literal("s3")),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    metadata: v.optional(v.any()),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["clientId", "status"]),

  // Extracted data from documents
  extractedData: defineTable({
    workspaceId: v.id("workspaceId"),
    documentId: v.id("documents"),
    clientId: v.id("clients"),
    fieldName: v.string(),
    value: v.any(),
    confidence: v.number(),
    sourceLocation: v.optional(v.object({
      page: v.optional(v.number()),
      section: v.optional(v.string()),
      line: v.optional(v.number()),
    })),
    reviewStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_client", ["clientId"])
    .index("by_review_status", ["documentId", "reviewStatus"]),

  // Proposals
  proposals: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    name: v.string(),
    quoteIds: v.array(v.id("documents")),
    status: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    outputStorageId: v.optional(v.string()),
    outputFormat: v.optional(v.union(v.literal("pdf"), v.literal("docx"))),
    data: v.optional(v.any()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["clientId", "status"]),

  // Policy comparisons
  comparisons: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    name: v.string(),
    policy1Id: v.id("documents"),
    policy2Id: v.id("documents"),
    status: v.union(
      v.literal("draft"),
      v.literal("comparing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    outputStorageId: v.optional(v.string()),
    diffData: v.optional(v.any()),
    materialChanges: v.optional(v.array(v.object({
      field: v.string(),
      change: v.union(v.literal("new"), v.literal("removed"), v.literal("modified")),
      impact: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      description: v.string(),
    }))),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["clientId", "status"]),

  // Workflows
  workflows: defineTable({
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
    agentSessionId: v.optional(v.string()),
    config: v.optional(v.any()),
    runs: v.number(),
    lastRunAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_status", ["clientId", "status"])
    .index("by_favorite", ["clientId", "isFavorite"]),

  // Workflow steps
  workflowSteps: defineTable({
    workspaceId: v.id("workspaces"),
    workflowId: v.id("workflows"),
    stepName: v.string(),
    stepOrder: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    data: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workflow", ["workflowId"])
    .index("by_status", ["workflowId", "status"]),

  // Chat sessions
  chatSessions: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),
    userId: v.id("users"),
    title: v.optional(v.string()),
    kvCacheKey: v.optional(v.string()),
    sources: v.object({
      webSearch: v.boolean(),
      appsAndIntegrations: v.boolean(),
    }),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_client", ["clientId"])
    .index("by_user", ["userId"])
    .index("by_last_message", ["userId", "lastMessageAt"]),

  // Chat messages
  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    citations: v.optional(v.array(v.object({
      documentId: v.optional(v.id("documents")),
      text: v.string(),
      sourceLocation: v.optional(v.string()),
    }))),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_created", ["sessionId", "createdAt"]),

  // KV cache metadata
  kvCacheMetadata: defineTable({
    workspaceId: v.id("workspaces"),
    cacheKey: v.string(),
    clientId: v.id("clients"),
    documentIds: v.array(v.id("documents")),
    sizeBytes: v.number(),
    version: v.string(),
    status: v.union(
      v.literal("generating"),
      v.literal("ready"),
      v.literal("expired"),
      v.literal("failed")
    ),
    redisKey: v.optional(v.string()),
    s3Key: v.optional(v.string()),
    lastAccessed: v.number(),
    ttl: v.number(), // seconds
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_cache_key", ["cacheKey"])
    .index("by_status", ["clientId", "status"])
    .index("by_last_accessed", ["lastAccessed"]),

  // Activity feed
  activities: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),
    userId: v.id("users"),
    type: v.string(),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_client", ["clientId", "createdAt"])
    .index("by_user", ["userId", "createdAt"]),
});