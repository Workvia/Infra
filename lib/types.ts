import { Id } from "@/convex/_generated/dataModel";

export type WorkspaceRole = "admin" | "member" | "viewer";

export type DocumentType =
  | "carrier_quote"
  | "binded_policy"
  | "dec_page"
  | "email"
  | "amendment"
  | "other";

export type DocumentStatus = "uploading" | "processing" | "completed" | "failed";

export type WorkflowType =
  | "proposal_generation"
  | "policy_checking"
  | "coverage_check"
  | "sov_builder"
  | "submission_intake"
  | "custom";

export type WorkflowStatus = "draft" | "pending" | "running" | "completed" | "failed";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ChangeImpact = "high" | "medium" | "low";

export type ChangeType = "new" | "removed" | "modified";

export interface Client {
  _id: Id<"clients">;
  workspaceId: Id<"workspaces">;
  name: string;
  domain?: string;
  description?: string;
  team?: string;
  categories: string[];
  status: "active" | "inactive";
  metadata?: any;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  _id: Id<"documents">;
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  name: string;
  type: DocumentType;
  storageId?: string;
  storageProvider: "convex" | "s3";
  status: DocumentStatus;
  fileSize?: number;
  mimeType?: string;
  metadata?: any;
  uploadedBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export interface ExtractedField {
  _id: Id<"extractedData">;
  workspaceId: Id<"workspaces">;
  documentId: Id<"documents">;
  clientId: Id<"clients">;
  fieldName: string;
  value: any;
  confidence: number;
  sourceLocation?: {
    page?: number;
    section?: string;
    line?: number;
  };
  reviewStatus: ReviewStatus;
  reviewedBy?: Id<"users">;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Workflow {
  _id: Id<"workflows">;
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  name: string;
  type: WorkflowType;
  status: WorkflowStatus;
  isFavorite: boolean;
  agentSessionId?: string;
  config?: any;
  runs: number;
  lastRunAt?: number;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export interface MaterialChange {
  field: string;
  change: ChangeType;
  impact: ChangeImpact;
  description: string;
}

export interface ChatMessage {
  _id: Id<"chatMessages">;
  sessionId: Id<"chatSessions">;
  workspaceId: Id<"workspaces">;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Array<{
    documentId?: Id<"documents">;
    text: string;
    sourceLocation?: string;
  }>;
  metadata?: any;
  createdAt: number;
}

export interface ChatSession {
  _id: Id<"chatSessions">;
  workspaceId: Id<"workspaces">;
  clientId?: Id<"clients">;
  userId: Id<"users">;
  title?: string;
  kvCacheKey?: string;
  sources: {
    webSearch: boolean;
    appsAndIntegrations: boolean;
  };
  metadata?: any;
  createdAt: number;
  updatedAt: number;
  lastMessageAt?: number;
}

// Agent-related types

export interface ExtractionResult {
  documentId: Id<"documents">;
  fields: Array<{
    name: string;
    value: any;
    confidence: number;
    sourceLocation?: {
      page?: number;
      section?: string;
      line?: number;
    };
  }>;
  documentType: DocumentType;
  carrier?: string;
}

export interface ProposalData {
  clientId: Id<"clients">;
  quotes: Array<{
    documentId: Id<"documents">;
    carrier: string;
    premium: number;
    limits: any;
    deductibles: any;
    forms: string[];
  }>;
  executiveSummary: string;
  recommendations: string[];
}

export interface ComparisonData {
  policy1Id: Id<"documents">;
  policy2Id: Id<"documents">;
  alignedFields: Record<string, {
    policy1Value: any;
    policy2Value: any;
    isDifferent: boolean;
  }>;
  materialChanges: MaterialChange[];
  executiveSummary: string;
}

// Cache types

export interface KVCacheMetadata {
  cacheKey: string;
  clientId: Id<"clients">;
  documentIds: Id<"documents">[];
  sizeBytes: number;
  version: string;
  status: "generating" | "ready" | "expired" | "failed";
  redisKey?: string;
  s3Key?: string;
  lastAccessed: number;
  ttl: number;
}