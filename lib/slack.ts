import { TrendIdea } from './types';

/**
 * Sends notification to Slack webhook with top trends
 */
export async function notifySlack(trends: TrendIdea[]): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK;

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK not configured, skipping notification');
    return;
  }

  if (trends.length === 0) {
    // Send notification that no trends were found
    await sendSlackMessage(webhookUrl, {
      text: '🔍 Reddit Trend Scanner - No qualifying trends found this hour',
    });
    return;
  }

  // Format trends for Slack
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚀 Top Reddit Trends Found!',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Found *${trends.length}* trending micro-SaaS ideas:`,
      },
    },
  ];

  trends.forEach((trend, index) => {
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${index + 1}. ${trend.idea}*\n${trend.summary}\n\n📊 Score: ${trend.score} | 💰 Suggested: ${trend.suggested_pricing}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Post',
            emoji: true,
          },
          url: trend.url,
          action_id: `view_${index}`,
        },
      }
    );
  });

  await sendSlackMessage(webhookUrl, { blocks });
}

async function sendSlackMessage(webhookUrl: string, payload: object): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}
