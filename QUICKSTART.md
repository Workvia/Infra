# Via Insurance AI Platform - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 20+
- npm or pnpm

## Steps

### 1. Install Dependencies (1 min)

```bash
npm install
```

### 2. Set Up Convex (2 min)

```bash
# Login to Convex (opens browser)
npx convex login

# Initialize Convex project
npx convex dev
```

Follow the prompts:
- Create a new project named "via-insurance"
- Select your account
- Wait for deployment

**Copy the URL shown** (looks like: `https://your-project.convex.cloud`)

### 3. Set Up Environment Variables (1 min)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add **minimum required** variables:

```env
# From Convex (step 2)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Get free key at https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...
```

**Optional** (for full functionality):
```env
# WorkOS - Sign up at https://dashboard.workos.com/
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)

# Redis - Use Upstash free tier: https://upstash.com/
REDIS_URL=rediss://...

# S3 or Cloudflare R2 - For file storage
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=via-documents

# Pinecone - Free tier: https://app.pinecone.io/
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=via-insurance
```

### 4. Start Development Server (1 min)

```bash
# Terminal 1: Keep Convex running
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

### 5. Open Browser

Visit: **http://localhost:3000**

You should see:
- ✅ Via Insurance AI Platform
- ✅ Sidebar with navigation
- ✅ Client list page with mock data
- ✅ Dark/light mode toggle

## What Works Out of the Box

### ✅ Client Management
- View client list at `/clients`
- Click any client to see details
- Tabs for Overview, Workflows, Files, Assistant, Activity

### ✅ AI Assistant UI
- Navigate to `/assistant`
- Chat interface ready (needs Anthropic key to send messages)
- Source selection panel

### ✅ Document Extraction Agent
Test the extraction agent:

```bash
curl -X POST http://localhost:3000/api/documents/extract \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-123",
    "documentText": "Policy Number: ABC123\nNamed Insured: Acme Corp\nEffective Date: 01/01/2025"
  }'
```

You should see:
```json
{
  "success": true,
  "data": {
    "extractedData": "...",
    "steps": 5
  }
}
```

### ✅ AI Chat (if Anthropic key is set)
Navigate to `/assistant` and type a message. You'll get streaming responses!

## Next Steps

### Implement Proposal Generation (3 hours)

1. Copy `lib/agents/document-extraction-agent.ts` to `proposal-generation-agent.ts`
2. Modify system prompt for proposal generation
3. Create tools: `load_quotes`, `normalize_data`, `generate_summary`, `render_proposal`
4. Create API route: `app/api/proposals/generate/route.ts`
5. Test with sample data

### Set Up File Upload (2 hours)

1. Create S3 bucket (or use Cloudflare R2)
2. Implement `lib/services/storage.ts` (see IMPLEMENTATION_GUIDE.md)
3. Create upload API: `app/api/documents/upload/route.ts`
4. Add upload UI component

### Set Up Redis Cache (2 hours)

1. Sign up for Upstash (free tier): https://upstash.com/
2. Create Redis database
3. Copy connection URL to `.env.local`
4. Implement `lib/services/kv-cache.ts`
5. Test cache generation

### Set Up Vector Store (3 hours)

1. Sign up for Pinecone (free tier): https://app.pinecone.io/
2. Create index with dimension 1536
3. Implement `lib/services/rag.ts`
4. Index sample insurance knowledge
5. Test search

### Add Authentication (2 hours)

1. Sign up for WorkOS: https://dashboard.workos.com/
2. Create organization
3. Get API key and Client ID
4. Add middleware: `middleware.ts`
5. Protect routes

## Troubleshooting

### Convex not connecting
- Make sure `npx convex dev` is running in a terminal
- Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Try `npx convex dev --once` to reset

### TypeScript errors
```bash
# Regenerate Convex types
npx convex dev --once

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Dark mode not working
- Make sure you're using a browser that supports dark mode
- Try toggling with the moon/sun icon in the sidebar footer

### Agent errors
- Check `ANTHROPIC_API_KEY` in `.env.local`
- Make sure you have API credits
- Check console for detailed error messages

## Development Tips

### Hot Reload
Changes to files automatically reload:
- **Frontend**: Instant hot reload
- **Convex functions**: Auto-deploy on save
- **API routes**: Restart not needed

### Database Queries
View your data in Convex dashboard:
```bash
# Opens dashboard in browser
npx convex dashboard
```

### Type Generation
Convex automatically generates TypeScript types:
```typescript
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
```

### Component Library
All Shadcn components are in `components/ui/`:
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

## Testing

### Test Document Extraction
```bash
npm run test:extract
```

### Test Chat API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "What is general liability insurance?" }
    ]
  }'
```

## Resources

- **Full Setup Guide**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Project Overview**: See [README.md](./README.md)

## Need Help?

1. Check the documentation files
2. Search the codebase for examples
3. Check the console for error messages
4. Review Convex dashboard for database issues

## What's Next?

Once you have the basics running:

1. **Read IMPLEMENTATION_GUIDE.md** - Detailed instructions for each feature
2. **Read ARCHITECTURE.md** - Understand the system design
3. **Review PROJECT_SUMMARY.md** - See what's built and what's next

Happy coding! 🚀