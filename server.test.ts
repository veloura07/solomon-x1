import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';

// Save the original API key
const originalApiKey = process.env.GEMINI_API_KEY;

describe('POST /api/chat with unconfigured API key', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it('should return 500 when GEMINI_API_KEY is not set', async () => {
    // Import app dynamically after setting environment variable to ensure
    // the conditional check for the API key in server.ts behaves correctly.
    const { app } = await import('./server.js');

    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'Hello' }]
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: "GEMINI_API_KEY is not configured in the host environment. Please add it in Settings > Secrets."
    });
  });
});
