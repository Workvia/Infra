# Via Insurance AI Platform - Implementation Guide

This guide provides step-by-step instructions for implementing the core features of the Via platform.

## Table of Contents

1. [Setting Up the Development Environment](#setting-up-the-development-environment)
2. [Implementing Agents](#implementing-agents)
3. [Setting Up CAG (Cache-Augmented Generation)](#setting-up-cag)
4. [Setting Up RAG (Retrieval Augmented Generation)](#setting-up-rag)
5. [Implementing Workflows](#implementing-workflows)
6. [File Upload and Storage](#file-upload-and-storage)
7. [Authentication with WorkOS](#authentication-with-workos)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Setting Up the Development Environment

### 1. Prerequisites

Install required software:
```bash
# Node.js 20+ (using nvm)
nvm install 20
nvm use 20

# Install pnpm (optional, faster than npm)
npm install -g pnpm
```

### 2. Clone and Install

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### 3. Set Up Convex

```bash
# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev
```

Follow the prompts to create a new project or link to an existing one.

### 4. Configure Environment Variables

Edit `.env.local`:

```env
# Convex (from dashboard)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# Anthropic API Key (from https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-...

# WorkOS (from https://dashboard.workos.com/)
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)

# Redis (local or hosted)
REDIS_URL=redis://localhost:6379

# S3 (AWS or Cloudflare R2)
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=via-documents
S3_REGION=us-east-1
S3_ENDPOINT=  # Optional, for R2

# Pinecone (from https://app.pinecone.io/)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=via-insurance
```

### 5. Start Development Server

```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

Visit http://localhost:3000

---

## Implementing Agents

### Base Agent Structure

All agents extend the `BaseAgent` class:

```typescript
// lib/agents/your-agent.ts
import { BaseAgent, AgentConfig } from "./base-agent";

export class YourAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: "your-agent",
      description: "What your agent does",
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: `Your system prompt here`,
    };

    super(config);
    this.registerTools();
  }

  private registerTools() {
    this.registerTool({
      name: "your_tool",
      description: "What this tool does",
      input_schema: {
        type: "object",
        properties: {
          param1: { type: "string" },
          param2: { type: "number" },
        },
        required: ["param1"],
      },
      handler: async (params) => {
        // Your tool implementation
        return { result: "success" };
      },
    });
  }

  async executeTask(input: string) {
    const messages = [
      {
        role: "user" as const,
        content: input,
      },
    ];

    return await this.run(messages, {
      maxSteps: 10,
      onStep: (step) => {
        console.log(`Step ${step.step}:`, step.stopReason);
      },
    });
  }
}
```

### Document Extraction Agent Example

Already implemented in `/lib/agents/document-extraction-agent.ts`.

**Usage:**

```typescript
import { extractInsuranceDocument } from "@/lib/agents/document-extraction-agent";

const result = await extractInsuranceDocument(
  documentText,
  documentId
);
```

### Proposal Generation Agent

**Implementation:**

```typescript
// lib/agents/proposal-generation-agent.ts
import { BaseAgent, AgentConfig } from "./base-agent";

export class ProposalGenerationAgent extends BaseAgent {
  constructor() {
    super({
      name: "proposal-generator",
      description: "Creates client-ready insurance proposals from multiple carrier quotes",
      model: "claude-sonnet-4-5-20250929",
      systemPrompt: `You are an expert insurance proposal specialist...`,
    });

    this.registerTools();
  }

  private registerTools() {
    // Load quotes from cache
    this.registerTool({
      name: "load_client_quotes",
      description: "Load all selected quotes from KV cache",
      input_schema: {
        type: "object",
        properties: {
          clientId: { type: "string" },
          quoteIds: { type: "array", items: { type: "string" } },
        },
        required: ["clientId", "quoteIds"],
      },
      handler: async (params) => {
        // Load from Redis KV cache or DB
        // Return all quote data
      },
    });

    // Normalize carrier data
    this.registerTool({
      name: "normalize_data",
      description: "Normalize fields across different carrier formats",
      input_schema: {
        type: "object",
        properties: {
          quotes: { type: "array" },
        },
      },
      handler: async (params) => {
        // Normalize premium formats, dates, limits, etc.
      },
    });

    // Generate executive summary
    this.registerTool({
      name: "generate_summary",
      description: "Generate executive summary of proposal",
      input_schema: {
        type: "object",
        properties: {
          normalizedData: { type: "object" },
        },
      },
      handler: async (params) => {
        // Create summary highlighting key differences and value
      },
    });

    // Render document
    this.registerTool({
      name: "render_proposal",
      description: "Render final proposal document",
      input_schema: {
        type: "object",
        properties: {
          proposalData: { type: "object" },
          format: { type: "string", enum: ["pdf", "docx"] },
        },
      },
      handler: async (params) => {
        // Use a PDF library to generate document
        // Store in S3, return URL
      },
    });
  }

  async generateProposal(clientId: string, quoteIds: string[]) {
    const messages = [
      {
        role: "user" as const,
        content: `Generate a comprehensive insurance proposal for client ${clientId} using quotes: ${quoteIds.join(", ")}

1. Load all quotes using load_client_quotes
2. Normalize the data using normalize_data
3. Generate an executive summary using generate_summary
4. Render the final proposal using render_proposal`,
      },
    ];

    return await this.run(messages, { maxSteps: 15 });
  }
}
```

---

## Setting Up CAG (Cache-Augmented Generation)

CAG preloads client context into Claude's extended context window and caches it for fast, cost-effective access.

### 1. Redis Setup

```bash
# Local development (Docker)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Or use a hosted service (Upstash, Redis Cloud, etc.)
```

### 2. KV Cache Service

Create a service to manage KV caches:

```typescript
// lib/services/kv-cache.ts
import { Redis } from "ioredis";
import { Id } from "@/convex/_generated/dataModel";

const redis = new Redis(process.env.REDIS_URL!);

export interface ClientContext {
  clientId: string;
  documents: Array<{
    id: string;
    type: string;
    content: string;
    metadata: any;
  }>;
  profile: any;
  version: string;
}

export class KVCacheService {
  // Generate cache key
  static getCacheKey(clientId: string, version: string): string {
    return `kv_cache:${clientId}:${version}`;
  }

  // Store client context in cache
  static async setClientContext(
    clientId: string,
    context: ClientContext,
    ttl: number = 86400 // 24 hours
  ): Promise<void> {
    const key = this.getCacheKey(clientId, context.version);
    await redis.setex(key, ttl, JSON.stringify(context));
  }

  // Load client context from cache
  static async getClientContext(
    clientId: string,
    version: string
  ): Promise<ClientContext | null> {
    const key = this.getCacheKey(clientId, version);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Generate context from database
  static async generateClientContext(
    clientId: Id<"clients">
  ): Promise<ClientContext> {
    // In production, this would:
    // 1. Query Convex for all client documents
    // 2. Load document content from S3
    // 3. Assemble into structured context
    // 4. Calculate version hash

    const context: ClientContext = {
      clientId: clientId,
      documents: [], // Loaded from DB
      profile: {}, // Loaded from DB
      version: Date.now().toString(), // Use content hash in production
    };

    return context;
  }

  // Precompute and cache client context
  static async precomputeCache(
    clientId: Id<"clients">
  ): Promise<void> {
    const context = await this.generateClientContext(clientId);
    await this.setClientContext(clientId, context);

    // Also backup to S3
    // await s3.upload({ /* ... */ });
  }

  // Invalidate cache when documents change
  static async invalidateCache(clientId: string): Promise<void> {
    const keys = await redis.keys(`kv_cache:${clientId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### 3. Using CAG in Agents

```typescript
// Load context at the start of agent execution
const context = await KVCacheService.getClientContext(clientId, "latest");

const systemPrompt = `You are an insurance AI assistant.

## Client Context (CACHED)
${JSON.stringify(context, null, 2)}

Use this context to answer questions about the client's insurance needs.`;

// This entire context will be cached by Claude, reducing costs by 90%
```

### 4. Automatic Cache Updates

Set up webhooks to invalidate cache when documents change:

```typescript
// convex/documents.ts
export const create = mutation({
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", args);

    // Trigger cache invalidation
    await KVCacheService.invalidateCache(args.clientId);

    // Trigger async cache regeneration
    await KVCacheService.precomputeCache(args.clientId);

    return documentId;
  },
});
```

---

## Setting Up RAG (Retrieval Augmented Generation)

RAG is used for industry knowledge that exceeds the context window.

### 1. Pinecone Setup

```bash
# Sign up at https://app.pinecone.io/
# Create an index with:
# - Dimensions: 1536 (for OpenAI embeddings) or 1024 (for Claude embeddings)
# - Metric: cosine
# - Pod type: p1.x1 (starter)
```

### 2. RAG Service

```typescript
// lib/services/rag.ts
import { Pinecone } from "@pinecone-database/pinecone";
import Anthropic from "@anthropic-ai/sdk";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export class RAGService {
  private index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

  // Generate embeddings using Claude (or OpenAI)
  async generateEmbedding(text: string): Promise<number[]> {
    // Claude doesn't have native embeddings yet, use OpenAI or Voyage AI
    // For now, placeholder:
    return new Array(1536).fill(0);
  }

  // Store document in vector store
  async indexDocument(params: {
    id: string;
    text: string;
    metadata: {
      namespace: string;
      documentType: string;
      clientId?: string;
      [key: string]: any;
    };
  }): Promise<void> {
    const embedding = await this.generateEmbedding(params.text);

    await this.index.namespace(params.metadata.namespace).upsert([
      {
        id: params.id,
        values: embedding,
        metadata: params.metadata,
      },
    ]);
  }

  // Search for relevant documents
  async search(params: {
    query: string;
    namespace: string;
    topK?: number;
    filter?: Record<string, any>;
  }): Promise<Array<{ id: string; score: number; metadata: any; text?: string }>> {
    const embedding = await this.generateEmbedding(params.query);

    const results = await this.index.namespace(params.namespace).query({
      vector: embedding,
      topK: params.topK || 5,
      filter: params.filter,
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata,
    }));
  }

  // Search industry knowledge
  async searchIndustryKnowledge(
    query: string,
    category?: string
  ): Promise<string[]> {
    const results = await this.search({
      query,
      namespace: "industry-knowledge",
      topK: 3,
      filter: category ? { category } : undefined,
    });

    return results.map((r) => r.metadata?.text || "");
  }

  // Search state regulations
  async searchStateRegulations(
    query: string,
    state: string
  ): Promise<string[]> {
    const results = await this.search({
      query,
      namespace: `state-regulations-${state}`,
      topK: 3,
    });

    return results.map((r) => r.metadata?.text || "");
  }
}
```

### 3. Populating the Vector Store

Create a script to index industry knowledge:

```typescript
// scripts/index-knowledge-base.ts
import { RAGService } from "../lib/services/rag";
import fs from "fs";

async function indexKnowledgeBase() {
  const rag = new RAGService();

  // Example: Index ISO forms
  const isoForms = JSON.parse(fs.readFileSync("data/iso-forms.json", "utf-8"));

  for (const form of isoForms) {
    await rag.indexDocument({
      id: form.id,
      text: form.description,
      metadata: {
        namespace: "industry-knowledge",
        documentType: "iso-form",
        formNumber: form.number,
        category: "forms",
      },
    });
  }

  console.log(`Indexed ${isoForms.length} ISO forms`);

  // Index state regulations
  const regulations = JSON.parse(fs.readFileSync("data/regulations.json", "utf-8"));

  for (const reg of regulations) {
    await rag.indexDocument({
      id: reg.id,
      text: reg.text,
      metadata: {
        namespace: `state-regulations-${reg.state}`,
        documentType: "regulation",
        state: reg.state,
        topic: reg.topic,
      },
    });
  }

  console.log(`Indexed ${regulations.length} regulations`);
}

indexKnowledgeBase();
```

### 4. Using RAG in Agents

```typescript
// In agent tool handler
this.registerTool({
  name: "search_industry_knowledge",
  description: "Search insurance industry knowledge base",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string" },
      category: { type: "string" },
    },
  },
  handler: async (params) => {
    const rag = new RAGService();
    const results = await rag.searchIndustryKnowledge(
      params.query,
      params.category
    );
    return { results };
  },
});
```

---

## Implementing Workflows

Workflows are automated multi-step processes.

### 1. Workflow Definition

```typescript
// convex/workflows.ts
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    // Update status
    await ctx.db.patch(args.workflowId, {
      status: "running",
      lastRunAt: Date.now(),
    });

    try {
      // Execute based on workflow type
      switch (workflow.type) {
        case "proposal_generation":
          // Invoke proposal generation agent
          break;

        case "policy_checking":
          // Invoke policy comparison agent
          break;

        default:
          throw new Error(`Unknown workflow type: ${workflow.type}`);
      }

      await ctx.db.patch(args.workflowId, { status: "completed" });
    } catch (error) {
      await ctx.db.patch(args.workflowId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});
```

### 2. Workflow UI

Create a workflow execution page:

```typescript
// app/(app)/workflows/[id]/page.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function WorkflowPage({ params }: { params: { id: string } }) {
  const executeWorkflow = useMutation(api.workflows.executeWorkflow);

  const handleRun = async () => {
    await executeWorkflow({ workflowId: params.id as any });
  };

  return (
    <div>
      <Button onClick={handleRun}>Run Workflow</Button>
    </div>
  );
}
```

---

## File Upload and Storage

### 1. S3 Setup

```typescript
// lib/services/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2
});

export class StorageService {
  static async uploadDocument(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
    );

    return params.key;
  }

  static async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  }
}
```

### 2. Upload API Route

```typescript
// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/services/storage";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `documents/${Date.now()}-${file.name}`;

  await StorageService.uploadDocument({
    key,
    body: buffer,
    contentType: file.type,
  });

  return NextResponse.json({ success: true, key });
}
```

---

## Authentication with WorkOS

### 1. Setup

```bash
npm install @workos-inc/authkit-nextjs
```

### 2. Configure Middleware

```typescript
// middleware.ts
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware();

export const config = {
  matcher: [
    "/((?!_next|api/auth).*)",
  ],
};
```

### 3. Get User in Server Components

```typescript
import { getUser } from "@workos-inc/authkit-nextjs";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome {user.firstName}</div>;
}
```

---

## Testing

### 1. Unit Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/agents/extraction.test.ts
import { describe, it, expect } from "vitest";
import { DocumentExtractionAgent } from "@/lib/agents/document-extraction-agent";

describe("DocumentExtractionAgent", () => {
  it("extracts policy number correctly", async () => {
    const agent = new DocumentExtractionAgent();
    const result = await agent.extractDocument(
      "Policy Number: ABC123",
      "test-doc-1"
    );

    expect(result.steps).toBeGreaterThan(0);
  });
});
```

### 2. End-to-End Tests

Use Playwright for E2E testing:

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/upload.spec.ts
import { test, expect } from "@playwright/test";

test("upload document", async ({ page }) => {
  await page.goto("/clients/123");
  await page.click("text=Upload Document");
  // ... test file upload
});
```

---

## Deployment

### Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Convex

```bash
npx convex deploy
```

### Database Migrations

Convex handles migrations automatically based on schema changes.

---

## Next Steps

1. **Implement Proposal Generation Agent** - Follow the pattern from Document Extraction
2. **Set up Redis** - For KV caching
3. **Index Knowledge Base** - Populate Pinecone with insurance knowledge
4. **Add File Upload UI** - Build upload component
5. **Implement Auth** - Set up WorkOS
6. **Add Monitoring** - Set up logging and error tracking

## Resources

- [Claude API Docs](https://docs.anthropic.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Convex Docs](https://docs.convex.dev/)
- [WorkOS AuthKit](https://workos.com/docs/authkit)
- [Pinecone Docs](https://docs.pinecone.io/)

## Support

For questions, contact the development team or open an issue on GitHub.