import { Supermemory } from "supermemory";
import { Id } from "@/convex/_generated/dataModel";

// Initialize Supermemory client
let supermemoryClient: Supermemory | null = null;

function getSupermemoryClient(): Supermemory {
  if (!supermemoryClient) {
    supermemoryClient = new Supermemory({
      apiKey: process.env.SUPERMEMORY_API_KEY!,
    });
  }
  return supermemoryClient;
}

export interface ClientMemory {
  clientId: string;
  clientName: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    content: string;
    extractedData?: Record<string, any>;
  }>;
  profile: {
    name: string;
    domain?: string;
    description?: string;
    categories: string[];
  };
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}

export class SupermemoryService {
  private static client = getSupermemoryClient();

  /**
   * Add client context to Supermemory
   * This replaces the Redis KV cache with persistent memory storage
   */
  static async addClientMemory(clientId: string, memory: ClientMemory): Promise<string> {
    // Structure the content for optimal retrieval
    const content = `
# Client: ${memory.clientName} (ID: ${clientId})

## Profile
- Name: ${memory.profile.name}
- Domain: ${memory.profile.domain || "N/A"}
- Description: ${memory.profile.description || "N/A"}
- Categories: ${memory.profile.categories.join(", ")}

## Documents (${memory.documents.length} total)
${memory.documents
  .map(
    (doc) => `
### ${doc.name} (${doc.type})
Document ID: ${doc.id}
${doc.content ? `Content Preview: ${doc.content.substring(0, 500)}...` : ""}
${doc.extractedData ? `Extracted Data: ${JSON.stringify(doc.extractedData, null, 2)}` : ""}
`
  )
  .join("\n")}

${
  memory.conversationHistory && memory.conversationHistory.length > 0
    ? `
## Recent Conversation History
${memory.conversationHistory
  .slice(-5)
  .map((msg) => `- ${msg.role}: ${msg.content.substring(0, 200)}...`)
  .join("\n")}
`
    : ""
}
`;

    const response = await this.client.memories.add({
      content,
      metadata: {
        clientId,
        clientName: memory.clientName,
        type: "client_context",
        documentCount: memory.documents.length.toString(),
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Added client memory to Supermemory: ${clientId}`);
    return response.id;
  }

  /**
   * Add a single document to client's memory
   */
  static async addDocument(params: {
    clientId: string;
    clientName: string;
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    extractedData?: Record<string, any>;
  }): Promise<string> {
    const content = `
# Document: ${params.documentName}

**Client:** ${params.clientName} (${params.clientId})
**Document ID:** ${params.documentId}
**Type:** ${params.documentType}

## Content
${params.content}

${
  params.extractedData
    ? `
## Extracted Data
${JSON.stringify(params.extractedData, null, 2)}
`
    : ""
}
`;

    const response = await this.client.memories.add({
      content,
      metadata: {
        clientId: params.clientId,
        clientName: params.clientName,
        documentId: params.documentId,
        documentName: params.documentName,
        documentType: params.documentType,
        type: "document",
        timestamp: new Date().toISOString(),
      },
    });

    return response.id;
  }

  /**
   * Add conversation message to memory
   */
  static async addConversation(params: {
    clientId: string;
    clientName: string;
    userId: string;
    message: string;
    role: "user" | "assistant";
    context?: string;
  }): Promise<string> {
    const content = `
# Conversation with ${params.clientName}

**Client ID:** ${params.clientId}
**User ID:** ${params.userId}
**Role:** ${params.role}
**Timestamp:** ${new Date().toISOString()}

## Message
${params.message}

${
  params.context
    ? `
## Context
${params.context}
`
    : ""
}
`;

    const response = await this.client.memories.add({
      content,
      metadata: {
        clientId: params.clientId,
        clientName: params.clientName,
        userId: params.userId,
        role: params.role,
        type: "conversation",
        timestamp: new Date().toISOString(),
      },
    });

    return response.id;
  }

  /**
   * Search memories for a specific client
   */
  static async searchClientMemories(params: {
    clientId: string;
    query: string;
    limit?: number;
  }): Promise<
    Array<{
      id: string;
      content: string;
      score: number;
      metadata?: Record<string, any>;
    }>
  > {
    const response = await this.client.memories.search({
      query: params.query,
      filter: {
        clientId: params.clientId,
      },
      limit: params.limit || 5,
    });

    return response.results.map((result) => ({
      id: result.id,
      content: result.content,
      score: result.score || 0,
      metadata: result.metadata,
    }));
  }

  /**
   * Get all memories for a client
   */
  static async getClientMemories(clientId: string, limit: number = 20): Promise<
    Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>
  > {
    const response = await this.client.memories.list({
      filter: {
        clientId,
      },
      limit,
    });

    return response.memories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      metadata: memory.metadata,
    }));
  }

  /**
   * Delete memories for a client
   */
  static async deleteClientMemories(clientId: string): Promise<number> {
    const memories = await this.getClientMemories(clientId, 100);

    let deleted = 0;
    for (const memory of memories) {
      try {
        await this.client.memories.delete(memory.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete memory ${memory.id}:`, error);
      }
    }

    console.log(`Deleted ${deleted} memories for client ${clientId}`);
    return deleted;
  }

  /**
   * Update client memory (replaces existing)
   */
  static async updateClientMemory(
    memoryId: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.client.memories.update(memoryId, {
      content,
      metadata,
    });
  }

  /**
   * Get memory statistics for a client
   */
  static async getClientStats(clientId: string): Promise<{
    totalMemories: number;
    documents: number;
    conversations: number;
    lastUpdated?: string;
  }> {
    const memories = await this.getClientMemories(clientId, 100);

    const documents = memories.filter((m) => m.metadata?.type === "document").length;
    const conversations = memories.filter((m) => m.metadata?.type === "conversation").length;

    const timestamps = memories
      .map((m) => m.metadata?.timestamp)
      .filter(Boolean)
      .sort()
      .reverse();

    return {
      totalMemories: memories.length,
      documents,
      conversations,
      lastUpdated: timestamps[0] as string | undefined,
    };
  }
}

// Export convenience functions for use in agents

/**
 * Load client context from Supermemory for agents
 * This replaces loadClientContextForAgent from kv-cache.ts
 */
export async function loadClientContextFromSupermemory(
  clientId: string,
  query?: string
): Promise<string> {
  try {
    if (query) {
      // Search specific information
      const results = await SupermemoryService.searchClientMemories({
        clientId,
        query,
        limit: 5,
      });

      return results.map((r) => r.content).join("\n\n---\n\n");
    }

    // Get all client memories
    const memories = await SupermemoryService.getClientMemories(clientId, 20);

    if (memories.length === 0) {
      return `No memory found for client ${clientId}. This is a new client.`;
    }

    // Combine all memories into context
    return memories.map((m) => m.content).join("\n\n---\n\n");
  } catch (error) {
    console.error("Failed to load client context from Supermemory:", error);
    return `Error loading client context: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Add insurance document to Supermemory
 */
export async function addInsuranceDocument(params: {
  clientId: string;
  clientName: string;
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  extractedData?: Record<string, any>;
}): Promise<string> {
  return await SupermemoryService.addDocument(params);
}

/**
 * Search insurance knowledge in Supermemory
 */
export async function searchInsuranceKnowledge(query: string): Promise<string[]> {
  try {
    const results = await SupermemoryService.searchClientMemories({
      clientId: "insurance-knowledge", // Special client ID for industry knowledge
      query,
      limit: 3,
    });

    return results.map((r) => r.content);
  } catch (error) {
    console.error("Failed to search insurance knowledge:", error);
    return [];
  }
}