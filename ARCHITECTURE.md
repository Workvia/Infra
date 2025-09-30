# Via Insurance AI Platform - Architecture

## System Overview

Via is an insurance workflow automation platform that combines Cache-Augmented Generation (CAG) with selective RAG implementation to deliver intelligent document processing, proposal generation, policy comparison, and conversational AI.

## Core Architecture Principles

1. **Hybrid Intelligence**: CAG for bounded contexts (per-client), RAG for unbounded contexts (cross-client)
2. **Agent-Oriented Design**: Specialized subagents handle domain-specific tasks
3. **Separation of Concerns**: Claude SDK manages agentic workflows; Convex handles CRUD
4. **Context Optimization**: Leverage prompt caching and KV cache preloading
5. **Scalability Through Isolation**: Each client's context is independently cached

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **AI Chat**: Vercel AI SDK v5 Elements
- **State Management**: Zustand + TanStack Query

### Backend
- **Database**: Convex (real-time, serverless)
- **AI/ML**:
  - Anthropic Claude Sonnet 4.5 (main reasoning)
  - Claude Opus 4 (user-facing chat)
- **Authentication**: WorkOS AuthKit (invite-only)
- **File Storage**: S3 / Cloudflare R2
- **Cache Layer**: Redis (KV cache for CAG)
- **Vector Store**: Pinecone / Weaviate (RAG embeddings)

### Infrastructure
- **Hosting**: Vercel (Edge Functions + Serverless)
- **CDN**: Cloudflare
- **Runtime**: Node.js 20+

## CAG vs RAG Decision Matrix

### When to Use CAG (Cache-Augmented Generation)

**Criteria:**
- All relevant documents fit within 200K token context window
- Documents are scoped to a single client/entity
- Low retrieval latency is critical (< 1s first token)
- Complete context comprehension required
- Documents are relatively static

**Use Cases:**
- ✅ Document Extraction (single document)
- ✅ Proposal Generation (all quotes for one client)
- ✅ Policy Comparison (two policies)
- ✅ AI Assistant - Client Context (per-client documents)

**Benefits:**
- Zero retrieval latency
- Holistic context understanding
- 90% cost reduction via prompt caching
- Simplified architecture (no retrieval pipeline)

### When to Use RAG (Retrieval Augmented Generation)

**Criteria:**
- Knowledge base exceeds context window limits
- Cross-client intelligence needed
- Real-time information updates required
- Selective context provides efficiency gains
- Frequently updated knowledge base

**Use Cases:**
- ✅ AI Assistant - Industry Knowledge (regulations, forms, case law)
- ✅ Cross-Client Analytics (pricing benchmarks, patterns)
- ✅ Large Knowledge Bases (50+ state regulations)

**Benefits:**
- Scales beyond context limits
- Selective retrieval (only relevant context)
- Real-time knowledge updates
- Cross-client pattern detection

## Agent Architecture

### Main Orchestrator Agent
**Responsibility**: Route requests, manage session lifecycle, validate permissions

**Tools Available:**
- Session management
- Permission validation
- Subagent invocation

### Document Extraction Agent
**Model**: Claude Sonnet 4.5
**Context Mode**: CAG (single document, ~15-25K tokens)
**Max Turns**: 5

**Responsibilities:**
- Classify document type (policy, quote, dec page)
- Extract structured fields (named insured, policy #, carrier, dates, premiums, limits)
- Assign confidence scores (0.0-1.0)
- Cite source locations (page, section, line)
- Flag for human review if confidence < 0.85

**Tools:**
- `classify_insurance_document`
- `extract_policy_fields`
- `validate_against_carrier_spec`
- `ocr_process` (when needed)
- `store_to_vector_db`

**Output**: Structured JSON with confidence scores and source citations

### Proposal Generation Agent
**Model**: Claude Sonnet 4.5
**Context Mode**: CAG (multiple quotes per client, ~50-80K tokens)
**Max Turns**: 8

**Responsibilities:**
- Load all selected quotes from KV cache
- Normalize fields across carriers
- Resolve conflicts using precedence rules
- Generate executive summary
- Apply client branding
- Render PDF/DOCX

**Tools:**
- `load_client_quotes_from_cache` (CAG retrieval)
- `normalize_carrier_data`
- `resolve_field_conflicts`
- `generate_executive_summary`
- `apply_branding`
- `render_document`

**Output**: Branded proposal document (PDF/DOCX)

### Policy Comparison Agent
**Model**: Claude Sonnet 4.5
**Context Mode**: CAG (two policies, ~30-50K tokens)
**Max Turns**: 6

**Responsibilities:**
- Load both policies from KV cache
- Align comparable fields
- Detect material changes (NEW, REMOVED, MODIFIED)
- Assess impact (HIGH, MEDIUM, LOW)
- Generate comparison report

**Tools:**
- `load_policies_from_cache` (CAG retrieval)
- `align_policy_fields`
- `detect_material_changes`
- `assess_change_impact`
- `generate_comparison_report`

**Output**: Comparison report with highlighted differences

### Insurance Assistant Agent
**Model**: Claude Opus 4 (highest quality for user-facing chat)
**Context Mode**: Hybrid (CAG + RAG)
**Max Turns**: 20
**Streaming**: Enabled

**Context Budget (200K tokens):**
- System prompt: ~5K tokens (CACHED)
- Client documents (CAG): ~150K tokens (CACHED)
- Industry knowledge (RAG): ~10K tokens (retrieved)
- Conversation history: ~30K tokens
- Response buffer: ~5K tokens

**Responsibilities:**
- Answer insurance-related questions
- Analyze client documents (CAG)
- Reference industry knowledge (RAG)
- Provide citations for all claims
- Trigger subagents when needed

**Tools:**
- **CAG Tools:**
  - `load_client_kv_cache`
  - `semantic_search_loaded_context`
- **RAG Tools:**
  - `search_insurance_kb` (regulations, forms, case law)
  - `get_state_regulations`
  - `query_cross_client_patterns`
- **Utility:**
  - `WebSearch` (real-time info)
  - `trigger_extraction` (invoke extraction agent)

**Output**: Streaming response with citations

## Data Architecture

### Convex Database Schema

**Core Tables:**
- `workspaces` - Multi-tenant workspace management
- `users` - User accounts with roles (admin, member, viewer)
- `clients` - Insurance clients (companies/individuals)
- `documents` - Policy docs, quotes, dec pages
- `extractedData` - Structured fields from documents
- `proposals` - Generated proposals
- `comparisons` - Policy comparisons
- `workflows` - Automated workflow definitions
- `workflowSteps` - Individual workflow step tracking
- `chatSessions` - AI assistant conversation sessions
- `chatMessages` - Individual chat messages
- `kvCacheMetadata` - KV cache tracking
- `activities` - Activity feed/audit log

### Vector Store (Pinecone/Weaviate)

**Namespaces:**

1. **`client-{client_id}`** (CAG support)
   - Per-client document embeddings
   - Metadata: `{doc_id, doc_type, client_id, field_name, confidence}`
   - Used for: Semantic search within client context

2. **`industry-knowledge`** (RAG)
   - `insurance-forms` (ISO forms, endorsements)
   - `state-regulations-{state}` (state-specific laws)
   - `case-law` (relevant case law)
   - `carrier-specifications` (carrier-specific formats)

3. **`cross-client-intelligence`** (RAG, anonymized)
   - `pricing-benchmarks`
   - `coverage-patterns`
   - `claim-insights`

### Redis KV Cache (CAG)

**Structure:**
```
kv_cache:{client_id}:{version}    # Serialized context for CAG
  └─ TTL: 24 hours, refresh on access

session:{session_id}               # Chat session state
  └─ TTL: 6 hours

rate_limit:{user_id}               # Rate limiting
  └─ TTL: 1 minute
```

**Cache Composition:**
- System prompt (CACHED)
- Client profile (CACHED)
- Historical policies and quotes (CACHED)
- Recent chat messages (dynamic)
- New document uploads (incremental)

**Cache Lifecycle:**
1. **Compute**: Async background job after document upload
2. **Store**: Redis (hot) + S3 (cold backup)
3. **TTL**: 24 hours (hot), 30 days (cold)
4. **Eviction**: LRU with client priority weighting
5. **Invalidation**: On document modification/deletion

### Object Storage (S3/R2)

**Bucket Structure:**
```
documents/
  └─ {client_id}/{document_id}.pdf

proposals/
  └─ {client_id}/{proposal_id}.{pdf|docx}

comparisons/
  └─ {client_id}/{comparison_id}.{pdf|docx}

cache-backups/
  └─ kv-cache/{client_id}/{timestamp}.bin
```

## Data Flow

### Document Upload & Extraction
```
1. User uploads document
2. Store in S3, create DB record
3. Invoke Document Extraction Agent
4. Agent extracts fields with confidence scores
5. Store extracted data in DB + vector store
6. Append to KV cache (async)
7. Return to user with review UI
```

### Proposal Generation
```
1. User selects multiple carrier quotes
2. Check KV cache status (MISS → generate)
3. Load all quotes from KV cache (CAG)
4. Invoke Proposal Generation Agent
5. Agent normalizes, resolves conflicts, generates summary
6. Render branded document (PDF/DOCX)
7. Store in S3 + DB
8. Present to user for review/approval
```

### Policy Comparison
```
1. User selects 2 policies to compare
2. Load both policies from KV cache (CAG)
3. Invoke Policy Comparison Agent
4. Agent aligns fields, detects changes, assesses impact
5. Generate comparison report
6. Render document with highlighted changes
7. Store in S3 + DB
8. Present to user
```

### AI Assistant Chat
```
1. User sends message in chat
2. Load/resume session state
3. Load client KV cache (CAG) - ~150K tokens
4. Analyze query: determine if industry knowledge needed
5. If needed: RAG search (~10K tokens)
6. Invoke Insurance Assistant Agent
   - Context: System + Client Docs (CAG) + Industry Knowledge (RAG) + History
7. Generate response with citations
8. Stream to user in real-time
9. Append message to session (update cache)
10. Persist to DB
```

## Performance Targets

| Operation | Target Latency | Strategy |
|-----------|----------------|----------|
| Document Upload | < 2s | Async processing, immediate ack |
| Extraction Complete | < 30s | Parallel field extraction |
| KV Cache Load | < 500ms | Redis retrieval, precomputed |
| Chat First Token | < 1s | CAG eliminates retrieval latency |
| Chat Complete | < 5s | Streaming + optimized prompts |
| Proposal Gen | < 45s | CAG + parallel operations |
| Policy Comparison | < 30s | CAG + efficient diff algorithm |

## Cost Optimization

### Prompt Caching
Claude SDK automatically handles caching. Expected savings:

**Cacheable Components:**
- System prompts: 90% cost reduction
- Client context (KV cache): 90% cost reduction
- Industry knowledge: 75% cost reduction
- Insurance terminology: 90% cost reduction

**Per-Operation Costs (with caching):**
- Document Extraction: $0.08/doc (vs $0.40 without)
- Proposal Generation: $0.25/proposal (vs $1.20 without)
- AI Assistant Message: $0.02/msg (vs $0.12 without)

### Model Selection
- **Document Extraction**: Sonnet 4.5 (balanced speed/accuracy)
- **Proposal Generation**: Sonnet 4.5 (good quality, lower cost)
- **Policy Comparison**: Sonnet 4.5 (pattern matching strength)
- **AI Assistant**: Opus 4 (highest quality, user-facing)
- **Simple Classification**: Haiku 3.5 (fast, cheap)

## Scalability

### Horizontal Scaling
- **Agent Service**: Stateless pods, scale by CPU
- **API Gateway**: Load balanced, auto-scale
- **KV Cache Store**: Redis Cluster, read replicas
- **Vector Store**: Sharded by namespace
- **Database**: Convex (auto-scaling)
- **Object Storage**: CDN + distributed buckets

### KV Cache at Scale (1,000 clients)
- **Per Client**: ~50MB compressed
- **Total Hot**: ~50GB (top 20% active)
- **Redis Capacity**: ~100GB (2x buffer)
- **Strategy**: Eager load top 20%, lazy load others, LRU eviction

## Security

### Data Isolation
- KV caches scoped per client (no cross-contamination)
- Vector namespaces enforce client boundaries
- Cross-client RAG uses anonymized embeddings only

### Access Control
- Row-level security in Convex
- Agent tools validate `client_id` on every operation
- Workspace-level permission model (admin/member/viewer)

### Authentication
- WorkOS AuthKit (invite-only signup)
- Session-based with secure cookies
- MFA support via WorkOS

## Monitoring & Observability

### Key Metrics
- Agent invocation latency (p50, p95, p99)
- KV cache hit rate (target: >90%)
- Document extraction accuracy (target: >90%)
- Chat response time (target: <5s p95)
- Error rates by agent type

### Logging
- Structured logs (JSON)
- Agent session tracing
- User activity audit logs
- Error tracking with stack traces

## Future Enhancements

### Phase 2
- Multi-agent orchestration (agents calling agents)
- Custom workflow builder (no-code)
- Advanced analytics dashboard
- Mobile app (iOS/Android)

### Phase 3
- Real-time collaboration
- Voice interface (speech-to-text)
- Automated renewals
- Predictive analytics

### Phase 4
- White-label solution
- API for third-party integrations
- Marketplace for custom agents
- Multi-language support