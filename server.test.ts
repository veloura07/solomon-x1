import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app, setAi } from "./server";

describe("POST /api/chat", () => {
  beforeEach(() => {
    // Reset AI instance before each test
    setAi(null);
  });

  it("should return 500 if GEMINI_API_KEY is not configured (ai is null)", async () => {
    const response = await request(app).post("/api/chat").send({
      messages: [{ role: "user", content: "Hello" }]
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "GEMINI_API_KEY is not configured in the host environment. Please add it in Settings > Secrets."
    });
  });

  it("should return 400 if messages is missing", async () => {
    setAi({} as any); // Dummy ai instance so it passes the first check

    const response = await request(app).post("/api/chat").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid chest payloads: messages must be an array."
    });
  });

  it("should return 400 if messages is not an array", async () => {
    setAi({} as any);

    const response = await request(app).post("/api/chat").send({
      messages: "not an array"
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid chest payloads: messages must be an array."
    });
  });

  it("should successfully generate content and return valid JSON", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        text: "Mocked AI response",
        confidenceScore: 0.95,
        doubtAnalysis: "No doubts."
      })
    });

    setAi({
      models: {
        generateContent: mockGenerateContent
      }
    } as any);

    const response = await request(app).post("/api/chat").send({
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" }
      ],
      systemInstruction: "Custom instruction"
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      text: "Mocked AI response",
      confidenceScore: 0.95,
      doubtAnalysis: "No doubts."
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hi" }] }
      ],
      config: expect.objectContaining({
        systemInstruction: "Custom instruction",
        responseMimeType: "application/json",
      })
    });
  });

  it("should use fallback JSON if AI returns invalid JSON", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: "Invalid JSON response"
    });

    setAi({
      models: {
        generateContent: mockGenerateContent
      }
    } as any);

    const response = await request(app).post("/api/chat").send({
      messages: [{ role: "user", content: "Hello" }]
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      text: "Invalid JSON response",
      confidenceScore: 0.88,
      doubtAnalysis: "Epistemic amplitude stable. Structural certainty high."
    });
  });

  it("should return 500 if AI generateContent throws an error", async () => {
    const mockGenerateContent = vi.fn().mockRejectedValue(new Error("AI error"));

    setAi({
      models: {
        generateContent: mockGenerateContent
      }
    } as any);

    const response = await request(app).post("/api/chat").send({
      messages: [{ role: "user", content: "Hello" }]
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "AI error"
    });
  });

  it("should return 500 if AI generateContent returns empty text", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: ""
    });

    setAi({
      models: {
        generateContent: mockGenerateContent
      }
    } as any);

    const response = await request(app).post("/api/chat").send({
      messages: [{ role: "user", content: "Hello" }]
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Empty response received from the neural cortex."
    });
  });
});
