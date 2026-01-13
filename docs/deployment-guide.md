# Deployment Guide for Reddit Trend Scanner

## Quick Start

### 1. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

### 2. Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

**Required:**
- `VERSAL_KEY` - Your Versal Gateway API key for AI analysis
- `SLACK_WEBHOOK` - Your Slack webhook URL for notifications
- `CRON_SECRET` - Random secret string to protect the /api/scan endpoint

**Optional:**
- `VERSAL_API_URL` - Custom Versal API URL (defaults to https://api.versal.ai/v1/chat/completions)

### 3. Verify Cron Job

After deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see `/api/scan` scheduled to run every hour (0 * * * *)
3. The cron job will automatically trigger the scan endpoint

### 4. Test the Endpoint

Manual test (with your CRON_SECRET):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/scan
```

Expected response:

```json
{
  "trends": [...],
  "timestamp": "2024-01-13T00:00:00.000Z"
}
```

### 5. Monitor in Slack

Within an hour, you should receive a Slack notification with:
- Top trending micro-SaaS ideas from Reddit
- Engagement scores
- Suggested pricing
- Direct links to Reddit posts

## Troubleshooting

### No Slack notifications?

1. Verify `SLACK_WEBHOOK` is set correctly in Vercel
2. Check Vercel logs for errors
3. Test the webhook manually:

```bash
curl -X POST YOUR_SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test from MVP Launcher"}'
```

### Cron job not running?

1. Check Vercel Dashboard → Deployments → Logs
2. Verify `vercel.json` is in the root directory
3. Ensure you're on a Vercel Pro plan (required for cron jobs)

### AI analysis not working?

1. Verify `VERSAL_KEY` is set correctly
2. Check the API URL is correct (default or custom)
3. Review Vercel function logs for API errors

## Next Steps

1. ✅ Monitor Slack for trend notifications
2. Review the trends and select promising ideas
3. Use the dashboard to greenlight ideas for landing page generation
4. Set up the landing page generator (next phase)

## Cost Estimate

- **Vercel Pro**: ~$20/month (required for cron jobs)
- **Versal API**: ~$0.01-0.05 per scan (using Haiku model)
- **Total**: ~$21-22/month for 24/7 automated scanning

## Support

For issues or questions, check:
- Vercel logs: `vercel logs`
- API documentation: `/docs/api-scan-readme.md`
- Project summary: `/docs/project-summary.md`
