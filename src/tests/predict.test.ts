import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// We mock the entire @google/genai module and create a mock class inside
vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models: any;
    constructor() {
      this.models = {
        generateContent: vi.fn(),
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
    process.env.GEMINI_API_KEY = 'test-api-key';
    vi.resetModules();
    app = (await import('../../server.js')).app;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('should return 400 if timeline is missing', async () => {
    const res = await request(app).post('/api/predict').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid timeline format. Expects array of events/context tags.");
  });

  it('should return 400 if timeline is not an array', async () => {
    const res = await request(app).post('/api/predict').send({ timeline: 'not an array' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid timeline format. Expects array of events/context tags.");
  });

  it('should return 500 if GEMINI_API_KEY is not configured', async () => {
    process.env.GEMINI_API_KEY = '';
    vi.resetModules();
    app = (await import('../../server.js')).app;
    const res = await request(app).post('/api/predict').send({ timeline: ['event1', 'event2'] });
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

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify(mockResponse)
    });

    class MockGoogleGenAI {
      models: any;
      constructor() {
        this.models = {
          generateContent: mockGenerateContent,
        };
      }
    }

    vi.doMock('@google/genai', () => ({ GoogleGenAI: MockGoogleGenAI }));

    vi.resetModules();
    app = (await import('../../server.js')).app;

    const timeline = ['started working', 'got stuck on a bug'];
    const res = await request(app).post('/api/predict').send({ timeline });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
  });
});
