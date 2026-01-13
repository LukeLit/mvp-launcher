# Environment Variables Setup Guide

## Required Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### 1. API_GATEWAY (Required)
- **Description**: Vercel Gateway API key for AI analysis using the Haiku model
- **Value**: Your Vercel Gateway API key
- **Example**: `API_GATEWAY=your_vercel_gateway_api_key_here`

### 2. SLACK_WEBHOOK (Required)
- **Description**: Slack webhook URL for sending trend notifications
- **Value**: Your Slack incoming webhook URL
- **Example**: `SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
- **How to get**: 
  1. Go to https://api.slack.com/apps
  2. Create a new app or select existing
  3. Enable Incoming Webhooks
  4. Add webhook to your workspace
  5. Copy the webhook URL

### 3. CRON_SECRET (Recommended for Production)
- **Description**: Secret token to protect the /api/scan endpoint from unauthorized access
- **Value**: A random, secure string (generate using password generator)
- **Example**: `CRON_SECRET=your_random_secret_string_here`
- **Note**: Without this, the endpoint is publicly accessible

### 4. API_GATEWAY_URL (Optional)
- **Description**: Custom Vercel Gateway API endpoint URL
- **Default**: `https://api.vercel.com/v1/ai`
- **Example**: `API_GATEWAY_URL=https://api.vercel.com/v1/ai`
- **Note**: Only set this if you need to use a custom endpoint

## How to Add in Vercel

### Via Vercel Dashboard:
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `API_GATEWAY`)
   - **Value**: Your value
   - **Environments**: Select Production, Preview, and/or Development as needed
4. Click **Save**

### Via Vercel CLI:
```bash
vercel env add API_GATEWAY
# Paste your value when prompted

vercel env add SLACK_WEBHOOK
# Paste your value when prompted

vercel env add CRON_SECRET
# Paste your value when prompted
```

## Testing Locally

Create a `.env.local` file in your project root:

```bash
API_GATEWAY=your_vercel_gateway_api_key_here
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
CRON_SECRET=your_random_secret_here
```

**Note**: The `.env.local` file is gitignored and will not be committed.

## Verification

After adding environment variables to Vercel:

1. Redeploy your application (or wait for auto-deploy)
2. Check the deployment logs for any environment variable errors
3. Test the `/api/scan` endpoint:
   ```bash
   curl -H "Authorization: ******" \
     https://your-app.vercel.app/api/scan
   ```
4. Check your Slack channel for the test notification

## Summary

**Minimum required for production:**
- ✅ `API_GATEWAY` - For AI trend analysis
- ✅ `SLACK_WEBHOOK` - For notifications
- ✅ `CRON_SECRET` - For security (highly recommended)

**Total setup time**: ~5-10 minutes
