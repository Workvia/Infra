# Supermemory Integration

Via now uses **Supermemory** for persistent memory storage, replacing the Redis KV cache with a more sophisticated memory system that provides:

- 🧠 **Persistent Memory**: Client context, documents, and conversations stored permanently
- 🔍 **Semantic Search**: Fast semantic search across all memories with relevance scoring
- 💬 **Conversation History**: Automatic tracking of chat interactions for context continuity
- 📄 **Document Memory**: Insurance documents stored with full content and metadata
- 🎯 **Targeted Retrieval**: Query-based context loading for focused information retrieval

## Architecture

### Memory Types

Supermemory stores three types of memories for the Via platform:

1. **Client Context Memories** (`type: "client_context"`)
   - Comprehensive client profiles with all documents
   - Metadata: clientId, clientName, documentCount, timestamp
   - Used for: Loading complete client context in CAG mode

2. **Document Memories** (`type: "document"`)
   - Individual insurance documents with extracted data
   - Metadata: clientId, documentId, documentName, documentType
   - Used for: Semantic search across specific documents

3. **Conversation Memories** (`type: "conversation"`)
   - Chat messages with full context
   - Metadata: clientId, userId, role (user/assistant)
   - Used for: Maintaining conversation continuity across sessions

### Service Architecture

```typescript
// Core service class
SupermemoryService
├── addClientMemory()      // Store complete client context
├── addDocument()          // Store individual documents
├── addConversation()      // Track chat messages
├── searchClientMemories() // Semantic search within client
├── getClientMemories()    // Retrieve all memories
└── deleteClientMemories() // Cleanup

// Convenience functions for agents
├── loadClientContextFromSupermemory()  // Load client context (replaces KV cache)
├── addInsuranceDocument()              // Store insurance documents
└── searchInsuranceKnowledge()          // Search knowledge base
```

## Integration Points

### 1. Insurance Assistant Agent

**File**: `lib/agents/insurance-assistant-agent.ts`

**Changes**:
- Replaced `loadClientContextForAgent` with `loadClientContextFromSupermemory`
- Updated `load_client_context` tool to use Supermemory with optional query parameter
- Updated `search_client_documents` tool to use `SupermemoryService.searchClientMemories()`
- System prompt now references "Supermemory persistent memory"

**Benefits**:
- Client context persists across sessions
- Semantic search provides more relevant results
- Query-based loading for focused retrieval

### 2. Chat API

**File**: `app/api/chat/route.ts`

**Changes**:
- Replaced `loadClientContextForAgent` with `loadClientContextFromSupermemory`
- Added automatic conversation tracking via `SupermemoryService.addConversation()`
- Updated system prompt to reference Supermemory
- User messages automatically stored for conversation history

**Benefits**:
- Conversation continuity across sessions
- Full chat history available for context
- Automatic memory persistence without manual intervention

### 3. Document Upload

**File**: `app/api/documents/upload/route.ts`

**Changes**:
- Replaced `KVCacheService.appendDocumentToCache()` with `addInsuranceDocument()`
- Documents stored with full content and extracted data
- Automatic memory creation after successful extraction

**Benefits**:
- Documents persist permanently in Supermemory
- Searchable document content for semantic queries
- Extracted data available for immediate retrieval

## Environment Setup

### Required Environment Variable

Add to your `.env.local`:

```bash
SUPERMEMORY_API_KEY=your_api_key_here
```

Get your API key from [Supermemory](https://supermemory.ai/).

### Optional: Legacy Redis Support

Redis is now optional. If you want to maintain Redis as a backup cache, keep:

```bash
REDIS_URL=redis://localhost:6379  # Optional
```

## Usage Examples

### Load Client Context

```typescript
import { loadClientContextFromSupermemory } from "@/lib/services/supermemory";

// Load all client memories
const context = await loadClientContextFromSupermemory(clientId);

// Load with specific query for focused retrieval
const focusedContext = await loadClientContextFromSupermemory(
  clientId,
  "general liability coverage"
);
```

### Add Document to Memory

```typescript
import { addInsuranceDocument } from "@/lib/services/supermemory";

const memoryId = await addInsuranceDocument({
  clientId: "client_123",
  clientName: "Acme Corp",
  documentId: "doc_456",
  documentName: "GL Policy 2025",
  documentType: "policy",
  content: "Full document text...",
  extractedData: {
    carrier: "Hartford",
    policyNumber: "GL-2025-001",
    premium: 12500,
  },
});
```

### Search Client Memories

```typescript
import { SupermemoryService } from "@/lib/services/supermemory";

const results = await SupermemoryService.searchClientMemories({
  clientId: "client_123",
  query: "What are the cyber liability limits?",
  limit: 5,
});

results.forEach(result => {
  console.log(`Score: ${result.score}`);
  console.log(`Content: ${result.content}`);
  console.log(`Metadata:`, result.metadata);
});
```

### Track Conversation

```typescript
import { SupermemoryService } from "@/lib/services/supermemory";

await SupermemoryService.addConversation({
  clientId: "client_123",
  clientName: "Acme Corp",
  userId: "user_789",
  message: "What is our general aggregate limit?",
  role: "user",
  context: "Discussing GL policy",
});
```

## Migration from Redis KV Cache

### What Changed

| Feature | Old (Redis KV) | New (Supermemory) |
|---------|---------------|-------------------|
| Storage | Temporary with TTL | Persistent |
| Search | Key-based lookup | Semantic search |
| Context Loading | Full dump | Query-based retrieval |
| Conversations | Manual storage | Automatic tracking |
| Cost | Redis hosting | API-based pricing |

### Migration Steps

1. **No data migration required** - Supermemory starts fresh
2. **Upload existing documents** - They'll be automatically added to Supermemory
3. **Remove Redis dependency** (optional) - Can keep as backup cache
4. **Update environment variables** - Add `SUPERMEMORY_API_KEY`

### Backward Compatibility

The old `kv-cache.ts` service is still available if needed:

```typescript
import { KVCacheService } from "@/lib/services/kv-cache";
```

However, all agents and API routes now use Supermemory by default.

## Benefits of Supermemory

### 1. Persistent Memory
- Client context survives server restarts
- No cache invalidation or TTL management
- Long-term conversation history

### 2. Semantic Search
- Find relevant information without exact keyword matches
- Relevance scoring for better results
- Natural language queries

### 3. Simplified Architecture
- No Redis infrastructure to manage
- API-based service with built-in scaling
- Automatic metadata organization

### 4. Enhanced Context
- Query-based retrieval loads only relevant information
- Reduces token usage by fetching focused context
- Better performance for large client datasets

### 5. Conversation Continuity
- Full chat history across sessions
- Context-aware responses based on past interactions
- Automatic memory creation without manual intervention

## Performance Considerations

### Token Usage

Supermemory helps reduce token usage:

- **Query-based loading**: Only load relevant memories
- **Semantic search**: Find specific information without loading entire context
- **Summarization**: Store condensed versions of long documents

### Latency

- **Semantic search**: ~200-500ms for typical queries
- **Context loading**: ~500-1000ms for full client context
- **Memory creation**: Async, doesn't block response

### Cost

Supermemory pricing is based on:
- API calls (reads/writes)
- Storage volume
- Vector embeddings

See [Supermemory pricing](https://supermemory.ai/pricing) for details.

## Next Steps

### Anthropic Memory Tool Integration

Supermemory provides an official Anthropic Memory Tool that can be integrated for direct memory access from Claude:

```typescript
import { createMemoryTool } from "supermemory/anthropic";

const memoryTool = createMemoryTool({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

// Use with Claude Agent SDK
const tools = [memoryTool, ...otherTools];
```

This is planned for future implementation.

### Analytics and Insights

Track memory usage and retrieval patterns:

```typescript
const stats = await SupermemoryService.getClientStats(clientId);
// { totalMemories, documents, conversations, lastUpdated }
```

### Memory Management

Clean up old memories when needed:

```typescript
await SupermemoryService.deleteClientMemories(clientId);
```

## Troubleshooting

### "SUPERMEMORY_API_KEY not set"

Make sure you've added the API key to `.env.local`:

```bash
SUPERMEMORY_API_KEY=your_key_here
```

### Slow Context Loading

Use query-based loading for focused retrieval:

```typescript
// Instead of loading everything
const context = await loadClientContextFromSupermemory(clientId);

// Load specific information
const focused = await loadClientContextFromSupermemory(
  clientId,
  "policy limits and deductibles"
);
```

### No Results from Search

Check that documents are being added correctly:

```typescript
// Verify document was added
const memories = await SupermemoryService.getClientMemories(clientId);
console.log(`Total memories: ${memories.length}`);
```

## Support

For Supermemory-specific issues:
- [Supermemory Documentation](https://docs.supermemory.ai)
- [Supermemory Discord](https://discord.gg/supermemory)
- [GitHub Issues](https://github.com/supermemoryai/supermemory/issues)

For Via platform issues:
- GitHub Issues: [Create an issue]
- Email: support@via.ai