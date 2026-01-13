### MVP Launcher Project Summary

#### Overview
This project aims to create a semi-automated system for identifying trending micro-SaaS ideas from Reddit, validating them via pre-order landing pages, and building/deploying MVP web apps. The goal is self-sustaining income: pre-orders fund development, with minimal manual oversight. Built on Vercel (Pro account) using Next.js, integrated with AI agents (via Versal Gateway for models like Haiku for scanning, DeepSeek for code gen), GitHub for repos/PRs, Slack for notifications, and Stripe for payments. Target: Hands-off operation where you only greenlight ideas and QA final MVPs.

#### Core Flow
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

#### Tech Stack & Integrations
- **Framework**: Next.js 15 (App Router, TypeScript).
- **Hosting/Deploy**: Vercel Pro (env vars for keys: VERSAL_KEY, REDDIT_CLIENT_ID, SLACK_WEBHOOK, STRIPE_KEYS).
- **AI Models**: Route via Versal Gateway—Haiku (cheap scanning/summarizing), DeepSeek V2 (code/landing gen, cheap/free tier).
- **Automation**: Vercel cron jobs (/api/scan hourly), GitHub Actions (auto-merge/test PRs on approval), webhooks (Slack replies trigger builds).
- **Data/External**: Reddit API (snoowrap or JSON fetch), Stripe for payments, optional Midjourney for images.
- **Cost Controls**: Free tiers where possible (Vercel previews, DeepSeek); under $20 for initial 10 MVPs.

#### User Interaction
- Minimal: Check Slack pings (1-2x/day), greenlight via reply/button, QA previews (click-test-deploy).
- Dashboard for oversight: Auto-refreshes trends, manual scan triggers.

#### Goals & Constraints
- Start fresh repo (`mvp-launcher`), no bloat from existing projects.
- Focus on web tools (JS/TS/React/Next), self-hosted on Vercel (scale to Pro if needed).
- Evergreen: Recurring subs cover hosting/tokens; kill non-converting ideas fast.
- Test Iteratively: Scan + ping first, then layer builds.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Vercel account (Pro recommended for cron jobs)
- Versal Gateway API key for AI analysis
- Slack webhook URL for notifications

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local with your API keys
```

### Required Environment Variables

```bash
VERSAL_KEY=your_versal_api_key_here
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
CRON_SECRET=your_random_secret_here  # Optional but recommended
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000

# Test the scan endpoint
curl http://localhost:3000/api/scan
```

### Deployment

1. **Deploy to Vercel:**
   ```bash
   vercel deploy --prod
   ```

2. **Configure Environment Variables:**
   - Go to your Vercel project settings
   - Add the required environment variables
   - Redeploy if needed

3. **Verify Cron Job:**
   - Check Vercel dashboard → Project → Settings → Cron
   - The `/api/scan` route should run hourly (0 * * * *)
   - Monitor logs in Vercel dashboard

## Features Implemented

✅ **Reddit Trend Scanner** (`/api/scan`)
- Fetches hot posts from r/SaaS, r/indiehackers, r/SideProject, r/Entrepreneur
- Filters posts from last 24 hours with min 10 upvotes and 3 comments
- AI analysis using Haiku via Versal Gateway
- Slack notifications with formatted trends
- Hourly automated scans via Vercel cron
- Comprehensive error handling

## Project Structure

```
├── app/
│   ├── api/
│   │   └── scan/
│   │       └── route.ts          # Main scan API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── reddit.ts                 # Reddit API integration
│   ├── versal.ts                 # Versal Gateway AI integration
│   ├── slack.ts                  # Slack webhook notifications
│   └── types.ts                  # TypeScript type definitions
├── docs/
│   ├── api-scan-readme.md        # API documentation
│   ├── project-summary.md
│   └── docs/
│       └── ai-agent-prompts.md
├── vercel.json                   # Vercel cron configuration
└── .env.example                  # Environment variables template
```

## API Documentation

See [docs/api-scan-readme.md](docs/api-scan-readme.md) for detailed API documentation.
