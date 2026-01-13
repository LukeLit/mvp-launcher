# Debugging Guide for MVP Launcher

## Quick Debugging Tips

### For 401 Unauthorized Errors

The `/api/scan` endpoint now supports both:
1. **Manual scans from dashboard** - No authentication required
2. **Vercel cron jobs** - Requires `Bearer ${CRON_SECRET}` header

If you're getting 401 errors:
- ✅ Manual scans from the dashboard UI should work without auth
- ✅ Cron jobs need the `Authorization: Bearer ${CRON_SECRET}` header
- ❌ If you send an auth header with the wrong secret, you'll get 401

### Browser Console Debugging

The dashboard now logs detailed information to the browser console:

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for these log messages:
   - `🔍 Starting manual scan...` - Scan initiated
   - `📡 Response status: 200` - API response received
   - `✅ Scan complete:` - Shows full scan results
   - `📊 Found X trends` - Number of trends found
   - `❌ Error:` - Any errors that occurred

### Common Issues & Solutions

#### Issue: "Scan failed: 401"
**Cause:** CRON_SECRET is set and an incorrect auth header was sent
**Solution:** Manual scans from dashboard don't need auth - this is fixed in latest version

#### Issue: "Scan failed: 500"
**Possible causes:**
1. Reddit API is unreachable (network restrictions)
2. AI Gateway (API_GATEWAY) is misconfigured
3. Slack webhook (SLACK_WEBHOOK) is invalid

**Solution:**
- Check Vercel function logs for detailed error
- Verify environment variables are set correctly
- Test each component individually

#### Issue: No trends found (0 results)
**Possible causes:**
1. No qualifying Reddit posts in the last 24 hours
2. Reddit API fetch failed (check console logs)
3. AI analysis skipped due to missing API_GATEWAY

**Solution:**
- Check browser console for Reddit fetch errors
- Verify API_GATEWAY environment variable is set
- Check Vercel logs for detailed API errors

### Vercel Function Logs

For production debugging:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Deployments" tab
4. Click on your latest deployment
5. Click on "Functions" tab
6. Find `/api/scan` and view logs

Logs will show:
- `🔍 Starting Reddit trend scan...`
- `📥 Fetched X posts from Reddit`
- `✅ Filtered to X qualifying posts`
- `🤖 AI identified X trend ideas`
- `📢 Slack notification sent`

### Environment Variables Checklist

Verify these are set in Vercel:

**Required:**
- [ ] `API_GATEWAY` - Vercel Gateway API key
- [ ] `SLACK_WEBHOOK` - Slack incoming webhook URL
- [ ] `CRON_SECRET` - Random secret for cron job protection

**Optional:**
- [ ] `API_GATEWAY_URL` - Custom API endpoint (defaults to `https://api.vercel.com/v1/ai`)

### Testing Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Add your API keys to .env.local
# Edit the file and add real values

# 4. Start dev server
npm run dev

# 5. Open browser to http://localhost:3000
# 6. Open browser console (F12)
# 7. Click "Run Scan" and watch console logs
```

### Sharing Bugs with Team/AI Agents

When reporting issues, include:

1. **Screenshot** - Show the error in the UI
2. **Browser Console** - Copy/paste console logs
3. **Vercel Logs** - Copy relevant function logs (if deployed)
4. **Environment** - Local dev or production?
5. **Steps to reproduce** - What did you click?

Example bug report:
```
**Issue:** Getting 401 error when running scan

**Environment:** Production on Vercel

**Screenshot:** [attach screenshot]

**Browser Console:**
```
🔍 Starting manual scan...
📡 Response status: 401
❌ Scan failed: Unauthorized - Invalid credentials
```

**Steps:**
1. Opened dashboard at https://my-app.vercel.app
2. Clicked "Run Scan" button
3. Got red error message

**Expected:** Scan should run without authentication
**Actual:** Got 401 error
```

### Advanced Debugging

#### Enable Verbose Logging

Add this to your `.env.local`:
```bash
NODE_ENV=development
```

This enables additional logging in the code.

#### Test API Endpoint Directly

```bash
# Test the scan endpoint
curl -X POST https://your-app.vercel.app/api/scan

# Should return JSON with trends array
```

#### Check Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. Click "Run Scan"
4. Find the `/api/scan` request
5. Check:
   - Status code
   - Request headers
   - Response body
   - Timing

### Contact Support

If issues persist:
1. Collect all debugging info above
2. Create a GitHub issue with details
3. Tag relevant team members
4. Include environment and logs

## Quick Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 401 | Unauthorized | Check CRON_SECRET (manual scans don't need auth) |
| 500 | Server Error | Check Vercel logs for details |
| Network Error | Can't reach API | Check internet connection, verify URL |
| 0 trends | No results | Normal if no qualifying Reddit posts found |

## Helpful Commands

```bash
# View local logs
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View Vercel logs
vercel logs
```
