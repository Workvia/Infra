# Via Setup Guide

Complete setup guide for the Via Insurance AI Platform. Follow these steps in order to get your development environment running.

## Overview

Total estimated time: ~45 minutes

- ✅ GitHub Repository Setup (5 min)
- ✅ Convex Database (5 min)
- ✅ Anthropic API Key (1 min)
- ✅ Supermemory API Key (5 min)
- ✅ WorkOS Authentication (10 min)
- ✅ Cloudflare R2 Storage (10 min) - Recommended
- ✅ Pinecone Vector Store (10 min)
- ✅ Optional: Redis/Upstash (5 min)

---

## 1. GitHub Repository Setup (5 min)

### Create New Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `via-insurance-platform` (or your preferred name)
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

### Push to GitHub

Run these commands in your terminal from `/Users/grant/Desktop/Via`:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Via Insurance AI Platform

- Next.js 15 with App Router
- Shadcn/ui with dark/light mode
- Supermemory integration for persistent memory
- Claude Agent SDK with 4 specialized agents
- Hybrid CAG+RAG architecture
- Complete insurance workflows"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/via-insurance-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Visit your GitHub repo URL to confirm the code is pushed.

---

## 2. Convex Database Setup (5 min)

Convex provides real-time serverless database for Via.

### Sign Up

1. Go to [convex.dev](https://convex.dev)
2. Sign up with GitHub (recommended for easy deployment)
3. Click **"Create a project"**

### Create Project

1. **Project name**: `via-insurance-platform`
2. Click **"Create Project"**
3. You'll see your project dashboard

### Get Deployment URL

1. In the Convex dashboard, click your project
2. Go to **Settings** → **URL & Deploy Key**
3. Copy your **Deployment URL** (looks like: `https://your-project.convex.cloud`)

### Initialize Convex Locally

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Login to Convex
npx convex login

# Link to your project
npx convex dev --once

# When prompted:
# 1. Select "Link to existing project"
# 2. Choose "via-insurance-platform" from the list
# 3. Configuration will be saved to .env.local
```

### Update Environment Variables

The `npx convex dev --once` command automatically creates `.env.local` with:

```bash
CONVEX_DEPLOYMENT=prod:your-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

✅ **Checkpoint**: Run `npx convex dev` - you should see "Convex functions ready!" and the schema synced.

---

## 3. Anthropic API Key (1 min)

Get your Claude API key for AI agents.

### Get API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Click **"Get API Keys"** or go to Settings → API Keys
4. Click **"Create Key"**
5. Name it: `via-insurance-platform`
6. Copy the API key (starts with `sk-ant-`)

### Add to Environment

Add to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

✅ **Checkpoint**: The API key should start with `sk-ant-api03-`.

---

## 4. Supermemory API Key (5 min)

Supermemory provides persistent memory storage for client context and conversations.

### Sign Up

1. Go to [supermemory.ai](https://supermemory.ai)
2. Click **"Get Started"** or **"Sign Up"**
3. Create an account with email or GitHub

### Get API Key

1. After signup, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name it: `via-insurance-platform`
4. Copy the API key

### Add to Environment

Add to `.env.local`:

```bash
SUPERMEMORY_API_KEY=your-supermemory-api-key-here
```

✅ **Checkpoint**: Test the API key by starting the dev server and checking for any Supermemory connection errors.

---

## 5. WorkOS Authentication (10 min)

WorkOS AuthKit provides invite-only authentication for your team.

### Sign Up

1. Go to [workos.com](https://workos.com)
2. Sign up for a free account
3. Create a new organization if prompted

### Create Application

1. In the WorkOS dashboard, click **"Applications"**
2. Click **"Create Application"**
3. **Name**: `Via Insurance Platform`
4. Click **"Create"**

### Configure AuthKit

1. In your application, go to **"Authentication"** → **"AuthKit"**
2. Click **"Get Started with AuthKit"**
3. Configure redirect URIs:
   - **Development**: `http://localhost:3000/auth/callback`
   - **Production** (add later): `https://your-domain.com/auth/callback`

### Get Credentials

1. Go to **"Configuration"** or **"API Keys"**
2. Copy the following:
   - **Client ID** (looks like: `client_...`)
   - **API Key** (looks like: `sk_...`)

### Generate Cookie Password

Run this command to generate a secure cookie password:

```bash
openssl rand -base64 32
```

### Add to Environment

Add to `.env.local`:

```bash
# WorkOS Authentication
WORKOS_API_KEY=sk_test_your_key_here
WORKOS_CLIENT_ID=client_your_id_here
WORKOS_COOKIE_PASSWORD=your_generated_password_here
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Invite Users

1. In WorkOS dashboard, go to **"Users"**
2. Click **"Invite User"**
3. Enter email addresses for your team members
4. They'll receive invitation emails

✅ **Checkpoint**: Start dev server and visit `http://localhost:3000` - you should be redirected to WorkOS sign-in.

---

## 6. Cloudflare R2 Storage (10 min) - RECOMMENDED

Cloudflare R2 is S3-compatible storage with zero egress fees (free bandwidth).

### Why R2 over S3?

- ✅ **No egress fees** (S3 charges for downloads)
- ✅ **S3-compatible API** (same code works)
- ✅ **10 GB free storage/month**
- ✅ **Better pricing for insurance documents**

### Sign Up

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up or log in
3. Go to **R2** in the sidebar

### Create Bucket

1. Click **"Create bucket"**
2. **Name**: `via-insurance-docs`
3. **Location**: Choose closest to your users (e.g., North America)
4. Click **"Create bucket"**

### Get API Credentials

1. In R2 dashboard, click **"Manage R2 API Tokens"**
2. Click **"Create API Token"**
3. **Token name**: `via-insurance-platform`
4. **Permissions**:
   - ✅ Object Read
   - ✅ Object Write
5. **TTL**: Never expire (or set expiration)
6. Click **"Create API Token"**
7. Copy the credentials:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint URL** (looks like: `https://account-id.r2.cloudflarestorage.com`)

### Add to Environment

Add to `.env.local`:

```bash
# Cloudflare R2 Storage
S3_ACCESS_KEY_ID=your_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key
S3_BUCKET_NAME=via-insurance-docs
S3_REGION=auto
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Alternative: AWS S3

If you prefer AWS S3:

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com)
2. Create bucket: `via-insurance-docs`
3. Create IAM user with S3 permissions
4. Generate access keys
5. Use these environment variables:

```bash
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=via-insurance-docs
S3_REGION=us-east-1
# S3_ENDPOINT is not needed for AWS
```

✅ **Checkpoint**: Upload a test file to verify storage is working.

---

## 7. Pinecone Vector Store (10 min)

Pinecone provides vector search for RAG (Retrieval Augmented Generation).

### Sign Up

1. Go to [pinecone.io](https://www.pinecone.io)
2. Click **"Sign Up"** - use email or GitHub
3. Verify your email

### Create Index

1. In Pinecone dashboard, click **"Create Index"**
2. Configure:
   - **Name**: `via-insurance-knowledge`
   - **Dimensions**: `1536` (for OpenAI embeddings) or `1024` (for Voyage AI)
   - **Metric**: `cosine`
   - **Pod Type**: `s1.x1` (Starter pod - free tier)
   - **Replicas**: `1`
   - **Pods**: `1`
3. Click **"Create Index"**

### Get API Key

1. Go to **"API Keys"** in the left sidebar
2. Copy your **API Key**
3. Note your **Environment** (e.g., `us-east1-gcp`, `us-west1-gcp`)

### Add to Environment

Add to `.env.local`:

```bash
# Pinecone Vector Store
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=via-insurance-knowledge
```

### Seed Knowledge Base (Optional)

Via includes scripts to seed insurance knowledge:

```bash
# Seed with sample insurance forms and regulations
npm run seed:knowledge

# This will:
# - Upload ISO forms
# - Add state regulations
# - Index carrier specifications
```

✅ **Checkpoint**: Check Pinecone dashboard - you should see your index with 0 vectors (will populate when you upload documents).

---

## 8. Optional: Redis/Upstash (5 min)

**Note**: Redis is now **optional** since we use Supermemory for persistent memory. However, you can add it as a backup cache layer.

### Why Add Redis?

- ✅ Additional caching layer for performance
- ✅ Session storage
- ✅ Rate limiting

### Sign Up for Upstash

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Click **"Create Database"**

### Create Redis Database

1. **Name**: `via-insurance-cache`
2. **Type**: Regional (for better performance)
3. **Region**: Choose closest to your deployment
4. **Eviction**: No eviction (or LRU if you want)
5. Click **"Create"**

### Get Connection URL

1. In your database dashboard, go to **"Details"**
2. Copy the **REST URL** (recommended for edge functions)
   - Format: `https://your-db.upstash.io`
3. Or copy **Redis URL** (for traditional Redis):
   - Format: `redis://default:password@endpoint:port`

### Add to Environment

Add to `.env.local`:

```bash
# Redis (Optional)
REDIS_URL=redis://default:your-password@your-endpoint.upstash.io:6379
```

✅ **Checkpoint**: Optional - test Redis connection if you added it.

---

## 9. Complete .env.local File

Your final `.env.local` should look like this:

```bash
# Convex
CONVEX_DEPLOYMENT=prod:your-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# WorkOS Authentication
WORKOS_API_KEY=sk_test_your_key
WORKOS_CLIENT_ID=client_your_id
WORKOS_COOKIE_PASSWORD=your_generated_password
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# Supermemory
SUPERMEMORY_API_KEY=your-supermemory-key

# Cloudflare R2 Storage
S3_ACCESS_KEY_ID=your_r2_access_key
S3_SECRET_ACCESS_KEY=your_r2_secret_key
S3_BUCKET_NAME=via-insurance-docs
S3_REGION=auto
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com

# Pinecone Vector Store
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=via-insurance-knowledge

# Redis (Optional)
REDIS_URL=redis://default:password@endpoint.upstash.io:6379

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 10. Start Development Server

### Install Dependencies

```bash
npm install
```

### Start Convex Dev Mode

In one terminal:

```bash
npx convex dev
```

This will:
- Sync your schema to Convex
- Watch for changes
- Enable real-time updates

### Start Next.js Dev Server

In another terminal:

```bash
npm run dev
```

### Open Application

Visit: [http://localhost:3000](http://localhost:3000)

You should be redirected to WorkOS authentication.

---

## 11. Verify Setup

### Check All Services

1. **Authentication**: Can you sign in via WorkOS?
2. **Database**: Does Convex show connected in terminal?
3. **AI Agent**: Try the assistant - does it respond?
4. **File Upload**: Upload a test document
5. **Storage**: Check R2 dashboard for uploaded file
6. **Memory**: Check Supermemory for stored context

### Run Health Check (Optional)

Create a simple health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "convex": "connected",
    "anthropic": "ok",
    "supermemory": "ok",
    "storage": "ok",
    "pinecone": "ok"
  }
}
```

---

## 12. Deploy to Production (Later)

### Vercel Deployment (Recommended)

1. Push to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Update WorkOS Redirect

After deployment, update WorkOS redirect URI:
```
https://your-domain.vercel.app/auth/callback
```

---

## Troubleshooting

### "Cannot find module 'convex'"

```bash
npm install convex
```

### "Supermemory API key not set"

Check `.env.local` has:
```bash
SUPERMEMORY_API_KEY=your-key-here
```

Restart dev server after adding.

### "WorkOS redirect URI mismatch"

Ensure WorkOS dashboard has:
```
http://localhost:3000/auth/callback
```

### "Failed to upload to S3"

Check:
1. Bucket name matches `.env.local`
2. Endpoint URL is correct (especially for R2)
3. Access keys have write permissions

### Convex schema errors

```bash
npx convex dev --once
```

This re-syncs your schema.

---

## Next Steps

After setup is complete:

1. **Invite team members** via WorkOS
2. **Upload sample documents** to test extraction
3. **Try workflows** (Proposal Generation, Policy Comparison)
4. **Customize agents** in `lib/agents/`
5. **Add custom MCP tools** for your specific needs
6. **Seed Pinecone** with insurance knowledge base
7. **Configure Supermemory namespaces** for organization

---

## Support

- **Via Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/via-insurance-platform/issues)
- **Convex**: [docs.convex.dev](https://docs.convex.dev)
- **WorkOS**: [workos.com/docs](https://workos.com/docs)
- **Supermemory**: [docs.supermemory.ai](https://docs.supermemory.ai)
- **Anthropic**: [docs.anthropic.com](https://docs.anthropic.com)

---

## Estimated Costs (Development)

| Service | Free Tier | Estimated Monthly (Development) |
|---------|-----------|--------------------------------|
| Convex | 1M reads, 500K writes | **$0** |
| Anthropic | No free tier | **$20-50** (Claude usage) |
| Supermemory | Free tier available | **$0-10** |
| WorkOS | 1M MAU free | **$0** |
| Cloudflare R2 | 10GB storage | **$0** |
| Pinecone | 1 index free | **$0** |
| Upstash Redis | 10K commands/day | **$0** |
| **Total** | | **~$20-60/month** |

Production costs will scale with usage.

---

**Ready to build the future of insurance AI! 🚀**