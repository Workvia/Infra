# Via - Insurance AI Platform

An intelligent insurance workflow automation platform powered by Claude Agent SDK, featuring Cache-Augmented Generation (CAG), strategic RAG implementation, and conversational AI capabilities.

## Overview

Via combines AI-powered document processing, proposal generation, policy comparison, and conversational intelligence to streamline insurance operations. The platform leverages:

- **Claude Agent SDK** for intelligent automation
- **Vercel AI SDK v5** for streaming chat experiences
- **Convex** for real-time database operations
- **WorkOS AuthKit** for secure authentication
- **Next.js 15** with App Router
- **Shadcn/ui** for beautiful, accessible components

## Features

### 🤖 AI Assistant
Conversational AI with insurance expertise that provides:
- Client-specific document context (CAG)
- Industry knowledge retrieval (RAG)
- Cited responses with source attribution
- Real-time streaming responses

### 📄 Document Extraction
Automated extraction of structured data from insurance documents:
- Policy documents
- Carrier quotes
- Declaration pages
- Confidence scoring and review workflows

### 📊 Proposal Generation
Generate client-ready insurance proposals from multiple carrier quotes:
- Automatic field normalization
- Executive summaries
- Branded output (PDF/DOCX)

### 🔍 Policy Comparison
Side-by-side policy comparison with material change detection:
- Automated field alignment
- Impact assessment (High/Medium/Low)
- Highlighted differences

### 🔄 Workflows
Automated insurance workflows including:
- Proposal Generation
- Policy Checking
- Coverage Check
- SOV Builder
- Submission Intake

## Tech Stack

**Frontend:**
- Next.js 15 (App Router, React 19)
- TypeScript 5.3+
- Tailwind CSS 4
- Shadcn/ui components
- Vercel AI SDK v5 Elements

**Backend:**
- Convex (Real-time database)
- Anthropic Claude API
- WorkOS AuthKit (Authentication)
- Supermemory (Persistent memory storage with CAG)
- S3/R2 (Object storage)
- Pinecone (Vector store for RAG)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Convex account
- Anthropic API key
- WorkOS account
- Supermemory API key (for persistent memory)
- S3/R2 bucket (for file storage)
- Pinecone account (for vector store)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd via
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment

# WorkOS Authentication
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=<generate with: openssl rand -base64 32>
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Supermemory (for persistent memory storage)
SUPERMEMORY_API_KEY=...

# S3 / Object Storage
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=via-documents
S3_REGION=us-east-1

# Vector Store (Pinecone)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=via-insurance

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. Initialize Convex:
```bash
npx convex dev
```

Follow the prompts to create a new Convex project or link to an existing one.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
via/
├── app/
│   ├── (app)/                 # Main app routes (with sidebar)
│   │   ├── clients/          # Client management
│   │   ├── assistant/        # AI chat interface
│   │   └── workflows/        # Workflow management
│   ├── api/
│   │   └── chat/            # Chat API endpoint (AI SDK)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirects to /clients)
├── components/
│   ├── ui/                  # Shadcn components
│   ├── providers/           # Context providers
│   ├── app-sidebar.tsx      # Main navigation sidebar
│   └── theme-toggle.tsx     # Dark/light mode toggle
├── convex/
│   ├── schema.ts           # Database schema
│   ├── clients.ts          # Client queries/mutations
│   ├── workflows.ts        # Workflow queries/mutations
│   └── chatSessions.ts     # Chat queries/mutations
├── lib/
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Architecture

### CAG vs RAG Strategy

Via uses a **hybrid approach** with **Supermemory** for persistent memory:

**CAG (Cache-Augmented Generation) with Supermemory** for:
- ✅ Per-client document context stored persistently
- ✅ Conversation history and memory across sessions
- ✅ Proposal generation (all quotes for a client)
- ✅ Policy comparison (2 policies side-by-side)
- ✅ Fast response times with semantic search capabilities

**RAG (Retrieval Augmented Generation) with Pinecone** for:
- ✅ Industry knowledge base (state regulations, forms, case law)
- ✅ Cross-client intelligence (anonymized patterns)
- ✅ Knowledge that exceeds context window

### Data Flow

1. **Document Upload** → S3 Storage → Extraction Agent → Structured Data → Supermemory
2. **Proposal Generation** → Load Supermemory → Agent Processing → PDF/DOCX Output
3. **AI Chat** → Load Client Context from Supermemory (CAG) + Industry Knowledge (RAG) → Streaming Response + Store Conversation
4. **Memory Persistence** → All interactions stored in Supermemory for long-term context retention

### Agent Architecture

- **Main Orchestrator**: Routes requests to specialized subagents
- **Document Extraction Agent**: Extracts structured data from insurance documents
- **Proposal Generation Agent**: Creates client-ready proposals
- **Policy Comparison Agent**: Performs side-by-side comparisons
- **Insurance Assistant Agent**: Conversational AI with hybrid CAG+RAG

## Development

### Adding a New Page

Create a new route in `app/(app)/`:

```tsx
// app/(app)/your-page/page.tsx
export default function YourPage() {
  return <div>Your content</div>
}
```

### Adding Convex Functions

Add queries/mutations to `convex/`:

```typescript
// convex/yourTable.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("yourTable")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});
```

### Theme Customization

Edit theme colors in `app/globals.css`:

```css
@layer base {
  :root {
    --primary: 221.2 83.2% 53.3%;
    /* ... other colors */
  }
}
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables

Make sure to add all environment variables from `.env.local.example` to your Vercel project settings.

### Database Migration

Run Convex migrations:
```bash
npx convex deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: [View docs]
- Email: support@via.ai
