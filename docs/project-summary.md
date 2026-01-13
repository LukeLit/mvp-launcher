### MVP Launcher Project Summary

#### Overview
This project aims to create a semi-automated system for identifying trending micro-SaaS ideas from Reddit, validating them via pre-order landing pages, and building/deploying MVP web apps. The goal is self-sustaining income: pre-orders fund development, with minimal manual oversight. Built on Vercel (Pro account) using Next.js, integrated with AI agents (via Vercel Gateway for models like Haiku for scanning, DeepSeek for code gen), GitHub for repos/PRs, Slack for notifications, and Stripe for payments. Target: Hands-off operation where you only greenlight ideas and QA final MVPs.

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
- **Hosting/Deploy**: Vercel Pro (env vars for keys: API_GATEWAY, SLACK_WEBHOOK, STRIPE_KEYS).
- **AI Models**: Route via Vercel Gateway—Haiku (cheap scanning/summarizing), DeepSeek V2 (code/landing gen, cheap/free tier).
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
