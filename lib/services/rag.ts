import { Pinecone } from "@pinecone-database/pinecone";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Initialize Anthropic for embeddings (we'll use text completion as proxy)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export class RAGService {
  private index = pinecone.index(process.env.PINECONE_INDEX_NAME || "via-insurance");

  /**
   * Generate embeddings for text
   * Note: Claude doesn't have native embeddings yet, so we use a simple approach
   * In production, use OpenAI embeddings or Voyage AI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // For now, return a mock embedding
    // In production, use: const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
    // return response.data[0].embedding;

    // Mock 1536-dimensional embedding (OpenAI ada-002 size)
    return new Array(1536).fill(0).map(() => Math.random());
  }

  /**
   * Index a document in the vector store
   */
  async indexDocument(params: {
    id: string;
    text: string;
    metadata: {
      namespace: string;
      documentType: string;
      clientId?: string;
      category?: string;
      state?: string;
      [key: string]: any;
    };
  }): Promise<void> {
    const embedding = await this.generateEmbedding(params.text);

    await this.index.namespace(params.metadata.namespace).upsert([
      {
        id: params.id,
        values: embedding,
        metadata: {
          ...params.metadata,
          text: params.text, // Store text in metadata for retrieval
        },
      },
    ]);

    console.log(`Indexed document ${params.id} in namespace ${params.metadata.namespace}`);
  }

  /**
   * Search for similar documents
   */
  async search(params: {
    query: string;
    namespace: string;
    topK?: number;
    filter?: Record<string, any>;
    includeMetadata?: boolean;
  }): Promise<
    Array<{
      id: string;
      score: number;
      metadata: any;
      text?: string;
    }>
  > {
    const queryEmbedding = await this.generateEmbedding(params.query);

    const results = await this.index.namespace(params.namespace).query({
      vector: queryEmbedding,
      topK: params.topK || 5,
      filter: params.filter,
      includeMetadata: params.includeMetadata !== false,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata || {},
      text: match.metadata?.text as string | undefined,
    }));
  }

  /**
   * Search industry knowledge base
   */
  async searchIndustryKnowledge(params: {
    query: string;
    category?: "forms" | "regulations" | "case-law" | "carrier-specs";
    topK?: number;
  }): Promise<
    Array<{
      id: string;
      text: string;
      score: number;
      category: string;
    }>
  > {
    const results = await this.search({
      query: params.query,
      namespace: "industry-knowledge",
      topK: params.topK || 3,
      filter: params.category ? { category: params.category } : undefined,
    });

    return results.map((r) => ({
      id: r.id,
      text: r.text || "",
      score: r.score,
      category: r.metadata?.category || "unknown",
    }));
  }

  /**
   * Search state-specific regulations
   */
  async searchStateRegulations(params: {
    query: string;
    state: string;
    topK?: number;
  }): Promise<
    Array<{
      id: string;
      text: string;
      score: number;
      state: string;
      topic?: string;
    }>
  > {
    const results = await this.search({
      query: params.query,
      namespace: `state-regulations-${params.state}`,
      topK: params.topK || 3,
    });

    return results.map((r) => ({
      id: r.id,
      text: r.text || "",
      score: r.score,
      state: params.state,
      topic: r.metadata?.topic,
    }));
  }

  /**
   * Search cross-client intelligence (anonymized)
   */
  async searchCrossClientPatterns(params: {
    query: string;
    category?: "pricing" | "coverage" | "claims";
    excludeClientId?: string;
    topK?: number;
  }): Promise<
    Array<{
      id: string;
      text: string;
      score: number;
      insights: any;
    }>
  > {
    const filter = params.excludeClientId
      ? { clientId: { $ne: params.excludeClientId } }
      : undefined;

    const results = await this.search({
      query: params.query,
      namespace: "cross-client-intelligence",
      topK: params.topK || 3,
      filter: params.category
        ? { ...filter, category: params.category }
        : filter,
    });

    return results.map((r) => ({
      id: r.id,
      text: r.text || "",
      score: r.score,
      insights: r.metadata?.insights || {},
    }));
  }

  /**
   * Index ISO form
   */
  async indexISOForm(params: {
    formNumber: string;
    name: string;
    description: string;
    category: string;
  }): Promise<void> {
    const text = `${params.formNumber} - ${params.name}\n\n${params.description}`;

    await this.indexDocument({
      id: `iso-form-${params.formNumber}`,
      text,
      metadata: {
        namespace: "industry-knowledge",
        documentType: "iso-form",
        category: "forms",
        formNumber: params.formNumber,
        name: params.name,
      },
    });
  }

  /**
   * Index state regulation
   */
  async indexStateRegulation(params: {
    state: string;
    topic: string;
    title: string;
    text: string;
    reference?: string;
  }): Promise<void> {
    await this.indexDocument({
      id: `regulation-${params.state}-${params.topic}-${Date.now()}`,
      text: `${params.title}\n\n${params.text}`,
      metadata: {
        namespace: `state-regulations-${params.state}`,
        documentType: "regulation",
        state: params.state,
        topic: params.topic,
        title: params.title,
        reference: params.reference,
      },
    });
  }

  /**
   * Index client document (for semantic search within client context)
   */
  async indexClientDocument(params: {
    clientId: string;
    documentId: string;
    documentType: string;
    text: string;
    extractedData?: Record<string, any>;
  }): Promise<void> {
    await this.indexDocument({
      id: `client-doc-${params.clientId}-${params.documentId}`,
      text: params.text,
      metadata: {
        namespace: `client-${params.clientId}`,
        documentType: params.documentType,
        clientId: params.clientId,
        documentId: params.documentId,
        extractedData: params.extractedData,
      },
    });
  }

  /**
   * Search within client documents (semantic search)
   */
  async searchClientDocuments(params: {
    clientId: string;
    query: string;
    documentType?: string;
    topK?: number;
  }): Promise<
    Array<{
      documentId: string;
      text: string;
      score: number;
      extractedData?: any;
    }>
  > {
    const results = await this.search({
      query: params.query,
      namespace: `client-${params.clientId}`,
      topK: params.topK || 5,
      filter: params.documentType ? { documentType: params.documentType } : undefined,
    });

    return results.map((r) => ({
      documentId: r.metadata?.documentId || r.id,
      text: r.text || "",
      score: r.score,
      extractedData: r.metadata?.extractedData,
    }));
  }

  /**
   * Delete document from index
   */
  async deleteDocument(params: {
    id: string;
    namespace: string;
  }): Promise<void> {
    await this.index.namespace(params.namespace).deleteOne(params.id);
  }

  /**
   * Delete all documents for a client
   */
  async deleteClientDocuments(clientId: string): Promise<void> {
    const namespace = `client-${clientId}`;

    // Delete entire namespace
    await this.index.namespace(namespace).deleteAll();

    console.log(`Deleted all documents for client ${clientId}`);
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    return await this.index.describeIndexStats();
  }
}

// Export convenience function for use in agents
export async function searchInsuranceKnowledge(query: string, category?: string): Promise<string[]> {
  const rag = new RAGService();
  const results = await rag.searchIndustryKnowledge({
    query,
    category: category as any,
    topK: 3,
  });

  return results.map((r) => r.text);
}

export async function searchStateInfo(query: string, state: string): Promise<string[]> {
  const rag = new RAGService();
  const results = await rag.searchStateRegulations({
    query,
    state,
    topK: 3,
  });

  return results.map((r) => r.text);
}