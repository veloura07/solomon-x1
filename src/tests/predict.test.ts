import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

const mockGenerateContent = vi.hoisted(() => vi.fn());

// We mock the entire @google/genai module and create a mock class inside
vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models: any;
    constructor() {
      this.models = {
          generateContent: mockGenerateContent,
      };
    }
  }
  return { GoogleGenAI: MockGoogleGenAI };
});

describe('POST /api/predict', () => {
  let app: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.VITE_AUTH_TOKEN = 'test-auth-token';
    mockGenerateContent.mockReset();
    vi.resetModules();
    app = (await import('../../server.ts')).app;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('should return 400 if timeline is missing', async () => {
    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', 'Bearer test-auth-token')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid timeline format. Expects array of events/context tags.");
  });

  it('should return 400 if timeline is not an array', async () => {
    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', 'Bearer test-auth-token')
      .send({ timeline: 'not an array' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid timeline format. Expects array of events/context tags.");
  });

  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
  });

  it('should return chat responses successfully', async () => {
    const mockResponse = {
      text: 'Hello from Solomon X',
      confidenceScore: 0.91,
      doubtAnalysis: 'Minimal doubt detected.'
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockResponse)
    });

    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer test-auth-token')
      .send({
        messages: [{ role: 'user', content: 'Say hello' }],
        systemInstruction: 'Be concise.'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
  });

  it('should return 500 if GEMINI_API_KEY is not configured', async () => {
    process.env.GEMINI_API_KEY = '';
    vi.resetModules();
    app = (await import('../../server.ts')).app;
    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', 'Bearer test-auth-token')
      .send({ timeline: ['event1', 'event2'] });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("GEMINI_API_KEY not configured.");
  });

  it('should return predictions successfully', async () => {
    const mockResponse = {
      predictedNeeds: ["Coffee", "Focus Mode"],
      probabilityScore: 0.85,
      cognitiveOverloadRisk: "Medium",
      recommendedPreparation: "Take a break"
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockResponse)
    });

    vi.resetModules();
    app = (await import('../../server.ts')).app;

    const timeline = ['started working', 'got stuck on a bug'];
    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', 'Bearer test-auth-token')
      .send({ timeline });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
  });
});
