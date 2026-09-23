import https from 'https';
import http from 'http';

// ping /health every 10 mins to prevent Render spin-down
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
