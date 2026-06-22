import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from './server';

describe('API Health Endpoint', () => {
  it('should return a 200 OK status with the correct JSON structure', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('hasApiKey');
    expect(typeof response.body.hasApiKey).toBe('boolean');
    expect(response.body).toHaveProperty('platform', 'Solomon X Cognitive Node v1.4.0');
    expect(response.body).toHaveProperty('localTime');

    // Check if localTime is a valid ISO string
    const date = new Date(response.body.localTime);
    expect(date.toISOString()).toBe(response.body.localTime);
  });
});
