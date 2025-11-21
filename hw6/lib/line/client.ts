import { Client, ClientConfig, MessageAPIResponseBase } from '@line/bot-sdk';

/**
 * Creates and returns a Line Messaging API client
 */
export function createLineClient(): Client {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelAccessToken || !channelSecret) {
    throw new Error(
      'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET must be set in environment variables'
    );
  }

  const config: ClientConfig = {
    channelAccessToken,
    channelSecret,
  };

  return new Client(config);
}

/**
 * Singleton instance of Line client
 */
let lineClientInstance: Client | null = null;

/**
 * Gets or creates the Line client instance
 */
export function getLineClient(): Client {
  if (!lineClientInstance) {
    lineClientInstance = createLineClient();
  }
  return lineClientInstance;
}

/**
 * Sends a text message reply to a user
 */
export async function replyTextMessage(
  replyToken: string,
  text: string
): Promise<MessageAPIResponseBase> {
  const client = getLineClient();
  return await client.replyMessage(replyToken, {
    type: 'text',
    text,
  });
}

