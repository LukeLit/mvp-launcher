# Reddit Trend Scanner API

This API endpoint scans Reddit for trending micro-SaaS ideas and sends notifications to Slack.

## Endpoint

`GET /api/scan`

## Features

- ✅ Fetches hot posts from multiple subreddits (r/SaaS, r/indiehackers, r/SideProject, r/Entrepreneur)
- ✅ Filters posts from the last 24 hours with minimum engagement (10+ upvotes, 3+ comments)
- ✅ Uses AI (Haiku via Vercel Gateway) to analyze and rank trending ideas
- ✅ Sends formatted notifications to Slack with top trends
- ✅ Runs automatically every hour via Vercel cron
- ✅ Comprehensive error handling with Slack notifications

## Environment Variables

Required environment variables (add to Vercel project settings):

```bash
# Vercel Gateway API key for AI analysis
API_GATEWAY=your_vercel_gateway_api_key_here

# Slack webhook URL for notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: Cron secret for securing the endpoint
CRON_SECRET=your_random_secret_here
```

## Cron Schedule

The `/api/scan` route runs automatically every hour via Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/scan",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Manual Testing

You can manually trigger a scan by making a GET or POST request to:

```bash
# Local development
curl http://localhost:3000/api/scan

# Production (with cron secret if configured)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/scan
```

## Response Format

Success response:

```json
{
  "trends": [
    {
      "idea": "AI Podcast Clipper",
      "summary": "Tool to auto-clip and summarize podcast highlights",
      "url": "https://reddit.com/r/SaaS/...",
      "score": 85,
      "suggested_pricing": "$9/mo"
    }
  ],
  "timestamp": "2024-01-13T00:00:00.000Z"
}
```

Error response:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-13T00:00:00.000Z"
}
```

## Architecture

1. **Reddit Data Fetching** (`lib/reddit.ts`)
   - Uses Reddit's public JSON API (no authentication required)
   - Fetches hot posts from multiple subreddits
   - Filters by recency and engagement

2. **AI Analysis** (`lib/vercel-gateway.ts`)
   - Calls Vercel Gateway API with Haiku model
   - Analyzes posts for micro-SaaS opportunities
   - Ranks and filters top 5 trends

3. **Slack Notifications** (`lib/slack.ts`)
   - Formats trends as rich Slack blocks
   - Includes action buttons to view Reddit posts
   - Sends error notifications when issues occur

## Next Steps

- Monitor Slack for trend notifications
- Review and greenlight promising ideas
- Trigger landing page generation for selected trends
