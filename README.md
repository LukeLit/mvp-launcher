### MVP Launcher

## Overview
This project aims to create a semi-automated system for identifying trending micro-SaaS ideas from Reddit, validating them via pre-order landing pages, and building/deploying MVP web apps. The goal is self-sustaining income: pre-orders fund development, with minimal manual oversight. Built on Vercel (Pro account) using Next.js, integrated with AI agents (via API Gateway for models like Claude/Haiku for copy generation, Imagen for image generation), GitHub for repos/PRs, Slack for notifications, and Stripe for payments.

## Features

### Dashboard UI
Access the dashboard at `/dashboard` to:
- View trending micro-SaaS ideas from Reddit
- Generate AI-powered marketing copy (headlines, descriptions, CTAs)
- Generate hero images for landing pages
- Preview generated content in modals before use
- Track engagement scores and suggested pricing

### AI-Powered Content Generation

#### Generate Copy
Click "Generate Copy" on any trend to automatically create:
- **Headline**: Catchy, benefit-focused (max 60 characters)
- **Description**: Compelling 2-3 sentence value proposition
- **Call-to-Action**: Strong CTA button text (max 20 characters)

Uses Claude/Haiku via API Gateway for cost-effective, high-quality marketing copy.

#### Generate Image
Click "Generate Image" to create hero images for landing pages:
- Professional UI design
- Tech-focused, clean aesthetic
- Optimized for landing page hero sections

Currently uses placeholder images in demo mode. When configured with API_GATEWAY_KEY, integrates with Imagen or similar services.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

Required for full functionality:
```bash
# API Gateway for AI services
API_GATEWAY_KEY=your_api_gateway_key_here
API_GATEWAY_URL=https://api.anthropic.com/v1/messages  # Optional, defaults to Anthropic

# Optional integrations
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
SLACK_WEBHOOK_URL=your_slack_webhook_url
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the home page.
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the dashboard.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-copy/     # AI copy generation endpoint
│   │   └── generate-image/    # AI image generation endpoint
│   ├── dashboard/             # Dashboard page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   └── PreviewModal.tsx       # Reusable modal for previews
├── lib/
│   └── kv.ts                  # Vercel KV utilities
├── types/
│   └── trend.ts               # TypeScript types
└── docs/                      # Project documentation
```

## API Routes

### POST /api/generate-copy
Generates marketing copy for a trend.

**Request:**
```json
{
  "idea": "AI Podcast Clipper",
  "summary": "Tool to auto-clip and summarize podcast highlights"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "headline": "AI Podcast Clipper: Transform Your Workflow Today",
    "description": "Tool to auto-clip and summarize podcast highlights for social media sharing...",
    "cta": "Start Free Trial"
  }
}
```

### POST /api/generate-image
Generates a hero image for a trend.

**Request:**
```json
{
  "idea": "AI Podcast Clipper",
  "summary": "Tool to auto-clip and summarize podcast highlights"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://...",
    "prompt": "A modern, sleek hero image for a SaaS product..."
  }
}
```

## Core Flow
1. **Trend Scanning (Hourly Cron)**:
   - Poll Reddit subs (e.g., r/SaaS, r/indiehackers, r/SideProject) for posts indicating needs (e.g., "need tool for X", min 10 upvotes, last 24h).
   - Use cheap AI (Haiku) to extract, rank novel ideas (no dupes), summarize (idea, URL, score based on engagement).
   - Output top 3-5 as JSON, ping via Slack/email with summaries/pricing suggestions ($5-9/mo).

2. **User Greenlight**:
   - You receive Slack pings; reply "go" on one (or via dashboard button).
   - Triggers build chain.

3. **Landing Page Generation**:
   - AI (DeepSeek) generates Next.js landing: Hero headline solving pain, features list, Stripe pre-order button ($9/mo default), email signup, placeholder testimonials/hero image (Midjourney API for visuals).
   - Auto-create GitHub PR for new branch/repo, deploy preview on Vercel.
   - Post link back to original Reddit thread: "Launching your requested tool—pre-order now!"

4. **MVP Building (If Pre-Orders Hit Threshold)**:
   - Monitor Stripe/signups (e.g., >5 pre-orders flags build).
   - AI (DeepSeek) codes self-contained React/Next.js MVP: Core features from post, user auth (Clerk free), simple dashboard.
   - No heavy deps; Vercel-ready.
   - Auto-PR code to repo, deploy preview.
   - You QA (5-min test in preview), approve deploy to prod.

5. **Monitoring & Reporting**:
   - Daily Slack/email: Pre-order counts, Reddit replies, summaries (Haiku).
   - Dashboard UI: Trends table (idea/URL/score), refreshable, "Build Landing" buttons, test scan button.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4
- **Hosting/Deploy**: Vercel Pro (env vars for keys: API_GATEWAY_KEY, REDDIT_CLIENT_ID, SLACK_WEBHOOK, STRIPE_KEYS)
- **AI Models**: Claude Haiku (copy generation), Imagen (image generation via API Gateway)
- **Automation**: Vercel cron jobs (/api/scan hourly), GitHub Actions (auto-merge/test PRs on approval)
- **Data/External**: Reddit API, Stripe for payments, optional Vercel KV for caching

## Goals & Constraints
- Start fresh repo (`mvp-launcher`), no bloat from existing projects.
- Focus on web tools (JS/TS/React/Next), self-hosted on Vercel (scale to Pro if needed).
- Evergreen: Recurring subs cover hosting/tokens; kill non-converting ideas fast.
- Test Iteratively: Scan + ping first, then layer builds.

## License
MIT
