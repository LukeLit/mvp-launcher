Expanded AI Agent Prompts for MVP Launcher
Based on the project summary, I've expanded the key AI agent prompts below. These are designed to be copy-paste ready for your Versal Gateway or similar setup, with more detail for clarity, error-handling, and optimization. I've included placeholders for your specific keys/configs, and structured them for models like Haiku (cheap, fast tasks) or DeepSeek V2 (code generation). Each prompt includes:

Model Recommendation: Based on cost/efficiency.
Input Variables: What to feed in (e.g., from cron or user input).
Expected Output: Format for easy parsing in your code.
Tips: For integration/tweaks.

These prompts assume you're routing through Versal for multi-model access. Test them in isolation first (e.g., via a simple API call), then hook into your Next.js routes.

Trend Scanner Prompt
Model Recommendation: Haiku (or similar cheap/fast model for scanning/summarizing—keeps costs under pennies per run).

Full Prompt:
You are a Reddit trend scanner focused on micro-SaaS ideas. Analyze the provided Reddit posts data (JSON from Reddit API hot endpoint, last 24 hours, subs: r/SaaS, r/indiehackers, r/SideProject, r/Entrepreneur).
Steps:

Filter posts mentioning needs like "need a tool/app for X", "wish there was AI for Y", "anyone built Z?" or similar pain points. Require min 10 upvotes and at least 3 comments for relevance.
Extract key details: title, URL, upvotes, comment count, a 1-2 sentence summary of the need/problem.
Rank top 5 novel ideas: Score by engagement (upvotes + comments/2), ensure no duplicates (use semantic similarity—e.g., group similar "email sorter" ideas). Prioritize unsolved/unaddressed needs.
Suggest pricing: Based on niche, recommend $5-15/mo tier (e.g., $9/mo for indie tools).
If no qualifying posts, output empty array.

Output strict JSON array of objects:
[
{
"idea": "Short title of the idea (e.g., AI Podcast Clipper)",
"summary": "Brief need description",
"url": "Full Reddit post URL",
"score": Number (engagement score, 0-100),
"suggested_pricing": "$X/mo"
}
]
Handle errors: If data parse fails, output {error: "description"}.
Input data: [PASTE REDDIT JSON HERE]
Input Variables: Raw Reddit API JSON (from snoowrap or fetch, e.g., await r.getHot('SaaS', {limit: 20})).
Expected Output: JSON array for easy parsing in your /api/scan route. Send top 3 to Slack via webhook.
Tips: In code, use fetch to your Versal endpoint: await fetch('/api/versal', { body: JSON.stringify({ model: 'haiku', prompt: fullPromptWithData }) }). Run hourly via Vercel cron. If duplicates persist, add a cache (e.g., Redis on Vercel) to track seen ideas.

Landing Page Generator Prompt
Model Recommendation: DeepSeek V2 (great for code gen, cheap; fallback to Sonnet if needed for better UI intuition).

Full Prompt:
You are a Next.js expert building a high-converting landing page for a micro-SaaS MVP based on a Reddit trend.
Input: Idea details {idea: "AI Podcast Clipper", summary: "Tool to auto-clip and summarize podcast highlights", url: "reddit.com/post", suggested_pricing: "$9/mo"}.
Requirements:

Use Next.js 15 App Router, TypeScript, Tailwind CSS for styling (modern, clean UI: dark mode optional).
Structure: Hero section (headline solving pain, subheadline, CTA button), Features list (3-5 bullet points from summary), Pricing (single tier with Stripe Checkout button), Email signup form (simple input + submit, use Formspree or Vercel KV for storage), Testimonials placeholder (2 fake quotes), Footer with Reddit link.
Integrate Stripe: Use @stripe/stripe-js for pre-order button (monthly sub, use TEST keys). On click, redirect to checkout.
Hero image: Placeholder URL or generate description for Midjourney (e.g., "futuristic podcast clipping UI").
Responsive: Mobile-first, SEO-friendly (meta tags with idea as title).
No external deps beyond basics (stripe, tailwind); Vercel-deploy ready.

Output zip-like structure: Full code files as JSON object { "app/page.tsx": "code here", "components/Hero.tsx": "code here", ... } including package.json updates if needed.
Error if input invalid: {error: "description"}.
Input Variables: JSON object from selected trend (e.g., from Slack greenlight).
Expected Output: JSON of file paths/code strings. In your code, write these to a new Git branch via GitHub API, then PR and deploy preview on Vercel.
Tips: After gen, use GitHub Actions to auto-test (e.g., lint/build). For images, chain to Midjourney API: Add a sub-prompt output like "image_prompt: 'description'". Post the preview URL back to Reddit thread manually first, automate later with Reddit API.

MVP Builder Prompt
Model Recommendation: DeepSeek V2 (excels at full app code; cheap/free tier; use Opus for complex logic if DeepSeek duds).

Full Prompt:
You are a React/Next.js developer building a minimal viable product (MVP) SaaS app from a Reddit idea.
Input: Idea details {idea: "AI Podcast Clipper", summary: "Auto-detect highlights in podcasts, generate clips/summaries", features: ["Upload audio", "AI processing", "Download clips"], pricing: "$9/mo"} + pre-order count (e.g., 7).
Core requirements:

Next.js 15 App Router, TypeScript, Tailwind CSS.
Self-contained: No heavy backends; use Vercel KV/Edge for storage if needed.
Features: Dashboard (user auth via Clerk free tier—include setup), core functionality (e.g., for clipper: upload form, mock AI process with placeholder, output downloads).
Auth: Protected routes for paid users (integrate Stripe webhooks for sub status).
Simple UI: Clean, intuitive—landing redirects to dashboard post-signup.
Testable: Include basic unit tests (Jest) for key components.
Deploy-ready: vercel.json, env vars (CLERK_KEY, STRIPE_WEBHOOK_SECRET).

Only build if pre-orders >5; else output {skip: true}.
Output: Full repo structure as JSON { "app/dashboard/page.tsx": "code", "lib/utils.ts": "code", ... } including README with setup.
Handle complexity: Keep MVP to 5-10 files; stub AI parts (e.g., use fake summaries). Error: {error: "if can't build"}.
Input Variables: Extended trend JSON + Stripe pre-order data (from monitor).
Expected Output: JSON file structure/code. Auto-PR to main repo or new one; deploy preview for your QA.
Tips: For real AI (e.g., transcription), stub with Haiku calls in code. Limit to web apps—no mobile/native. If duds, refine prompt with examples (e.g., "like Notion's AI block"). Host on your Vercel account; subs cover costs.

Monitor Prompt
Model Recommendation: Haiku (lightweight summarizing; cheap for daily runs).

Full Prompt:
You are a SaaS monitor summarizing pre-order and feedback data.
Input: {landing_url: "mvp.vercel.app", stripe_data: [array of charges/signups], reddit_replies: [JSON from thread comments], pre_order_threshold: 5}.
Steps:

Count pre-orders (Stripe charges/emails).
Summarize Reddit replies: Key feedback, positives/negatives, new feature requests.
Flag actions: If pre-orders > threshold, recommend "build MVP". Else, "monitor" or "kill".
Daily report: Concise bullet points.

Output JSON:
{
"pre_orders": Number,
"summary": "Bullet point report",
"action": "build|monitor|kill",
"feedback_highlights": ["point1", "point2"]
}
Error: {error: "if data missing"}.
Input Variables: Fetched from Stripe API (use stripe-node in /api/monitor) + Reddit comments.
Expected Output: JSON for Slack/email. Run daily cron.
Tips: Secure Stripe with webhooks (Vercel handles). If feedback negative, auto-kill via GitHub close PR.
