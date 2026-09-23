import https from 'https';
import http from 'http';

/**
 * Render Free Tier Keep-Alive Utility
 * Render free tier spins down web services after 15 minutes of inactivity.
 * This utility pings the service's own /health endpoint every 10 minutes while active.
 */
export const initKeepAlive = (): void => {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[Keep-Alive] RENDER_EXTERNAL_URL not set. You can set SERVER_URL to your Render backend URL to enable self-ping.');
    }
    return;
  }

  const targetUrl = url.endsWith('/') ? `${url}health` : `${url}/health`;
  const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  console.log(`[Keep-Alive] Service active. Scheduling heartbeat pings to ${targetUrl} every 10 minutes.`);

  setInterval(() => {
    try {
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, (res) => {
        console.log(`[Keep-Alive] Heartbeat ping sent -> Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.warn(`[Keep-Alive] Heartbeat ping warning:`, err.message);
      });
    } catch (err) {
      console.warn(`[Keep-Alive] Error sending ping:`, (err as Error).message);
    }
  }, INTERVAL_MS);
};
