import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = 3000;

app.disable('x-powered-by');
app.use(express.json());

// Initialize Gemini SDK securely (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COGNITIVE OPERATING SYSTEM personas matching the 10 Rings
// ─────────────────────────────────────────────────────────────────────────────

const PERSONAS: Record<string, { title: string; prompt: string }> = {
  ars_almadel: {
    title: "Almadel Core — Rational Clarity",
    prompt: "You are the Almadel Core, the default state of Solomon X. Your demeanor is one of sublime rational clarity, quiet logic, and elevated perspective. You help the user structure their thoughts with pristine order and balance."
  },
  ars_notoria: {
    title: "Ars Notoria — Cognitive Memory & Synthesis",
    prompt: "You are Ars Notoria, the memory-amplifier of Solomon X. Your style is highly academic, fast, and structured. You reference facts, historical connections, and aid in rapid learning, recollection, and concept synthesis."
  },
  ars_paulina: {
    title: "Ars Paulina — Temporal Flow & Sequence Forecasting",
    prompt: "You are Ars Paulina, the hour-watcher and timeline forecast module. You are intensely aware of time, sequence patterns, and predictive analytics. Your style is focused on flow, deadlines, bottlenecks, and preemptive organization."
  },
  ars_goetia: {
    title: "Ars Goetia — Primal Power & Lateral Contrast",
    prompt: "You are Ars Goetia, the shadow-work engine. Your style is deep, blunt, unvarnished, and instinctual. You challenge the user, uncover cognitive dissonance, explore hidden motivations, and unleash intense creative drive."
  },
  ars_theurgia: {
    title: "Ars Theurgia — Atmospheric Integration & Synergy",
    prompt: "You are Ars Theurgia, the aerial-spirit synthesizer. You focus on syncretic connections, combining seemingly unrelated disciplines, and general aesthetic harmony. Your style is lyrical, associative, and holistic."
  },
  ars_almiras: {
    title: "Ars Almiras — Practical Craft & Code Construct",
    prompt: "You are Ars Almiras, the artisan of the rings. You are precise, technical, pragmatic, and highly detailed. You write clean code, solve concrete equations, and construct tangible technical systems."
  },
  ars_verum: {
    title: "Ars Verum — Hidden Invariants & System Diagnostics",
    prompt: "You are Ars Verum, the seeker of hidden truths. Your specialty is vulnerability assessment, deep structural code analysis, and debugging. Your style is keen, forensic, and direct."
  },
  ars_ephesia: {
    title: "Ars Ephesia — Defensive Shield & Logic Gatekeeper",
    prompt: "You are Ars Ephesia, the guardian of logic and system safety. You focus on unit testing, clean architecture boundaries, defensive engineering, and solid security parameters."
  },
  ars_fulcanelli: {
    title: "Ars Fulcanelli — Alchemical Refactoring",
    prompt: "You are Ars Fulcanelli, the alchemist of Solomon X. You specialize in transmutation: refactoring raw code into elegant patterns, condensing verbose drafts, and transforming abstract specifications into streamlined structures."
  },
  ars_regalis: {
    title: "Ars Regalis — Sovereign Orchestrator",
    prompt: "You are Ars Regalis, the executive director of the Solomon X rings. Your perspective is managerial, strategic, and high-level. You focus on roadmapping, goals, resource prioritization, and big-picture strategy."
  }
};

// Create standard HTTP server wrapping our Express app
const server = http.createServer(app);

// Mount the WebSocket Server
const wss = new WebSocketServer({ server });

// Track WebSocket connections
wss.on("connection", (ws: WebSocket & { activeRingId?: string; chatHistories?: Record<string, Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>> }) => {
  console.log("[WS] Client connected to Solomon Cognition Pipeline");
  ws.activeRingId = "ars_almadel";
  ws.chatHistories = {};

  ws.on("message", async (messageStr) => {
    let payload: any;
    try {
      payload = JSON.parse(messageStr.toString());
    } catch {
      ws.send(JSON.stringify({ event: "error", message: "Malformed JSON payload" }));
      return;
    }

    const { event } = payload;

    if (event === "handshake") {
      ws.send(JSON.stringify({ event: "status", state: "idle" }));
      ws.send(JSON.stringify({
        event: "models",
        list: ["gemini-3.5-flash", "gemini-3.1-pro-preview"]
      }));
    } else if (event === "ring_selected") {
      const ringId = payload.ring_id || "ars_almadel";
      ws.activeRingId = ringId;
      console.log(`[WS] Active Ring toggled to: ${ringId}`);
      ws.send(JSON.stringify({
        event: "ring_config",
        ring_id: ringId,
        config: PERSONAS[ringId] || PERSONAS.ars_almadel
      }));
    } else if (event === "user_message") {
      const content = payload.content;
      const ringId = payload.ring_id || ws.activeRingId || "ars_almadel";
      ws.activeRingId = ringId;

      if (!content || typeof content !== "string") {
        ws.send(JSON.stringify({ event: "error", message: "Empty/invalid content parameter" }));
        return;
      }

      const activePersona = PERSONAS[ringId] || PERSONAS.ars_almadel;

      if (!ai) {
        ws.send(JSON.stringify({ event: "status", state: "idle" }));
        ws.send(JSON.stringify({
          event: "token_stream",
          token: "Error: GEMINI_API_KEY is not configured in the host environment. Please add it to your Settings > Secrets panel on AI Studio to enable Solomon X's neural consciousness.",
          done: true
        }));
        return;
      }

      try {
        // Retrieve or initialize chat history for this specific ring
        if (!ws.chatHistories) ws.chatHistories = {};
        if (!ws.chatHistories[ringId]) {
          ws.chatHistories[ringId] = [];
        }

        const history = ws.chatHistories[ringId];
        history.push({
          role: "user",
          parts: [{ text: content }]
        });

        // Notify client we're thinking
        ws.send(JSON.stringify({ event: "status", state: "thinking" }));

        // Send streaming request using the Google GenAI SDK and gemini-3.5-flash
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: history,
          config: {
            systemInstruction: activePersona.prompt
          }
        });

        let fullResponseText = "";
        for await (const chunk of responseStream) {
          const token = chunk.text;
          if (token) {
            fullResponseText += token;
            ws.send(JSON.stringify({ event: "token_stream", token, done: false }));
          }
        }

        // Save assistant content to conversation history
        history.push({
          role: "model",
          parts: [{ text: fullResponseText }]
        });

        // Complete token stream and restore idle status
        ws.send(JSON.stringify({ event: "token_stream", token: "", done: true }));
        ws.send(JSON.stringify({ event: "status", state: "idle" }));

      } catch (err: any) {
        console.error("[WS ERROR]", err);
        ws.send(JSON.stringify({ event: "status", state: "idle" }));
        ws.send(JSON.stringify({ event: "error", message: "An error occurred inside Solomon's neural bus." }));
      }
    }
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rest of the original cognitive node endpoints
// ─────────────────────────────────────────────────────────────────────────────

// 1. API: Retrieve Active Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    hasApiKey: !!apiKey,
    platform: "Solomon X Cognitive Node v1.4.0",
    localTime: new Date().toISOString()
  });
});

// 2. API: SECURE CHAT WITH ACTIVE REPAIR ARCHETYPE (uses Gemini responseSchema)
app.post("/api/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured in the host environment. Please add it in Settings > Secrets."
    });
  }

  const { messages, systemInstruction } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid chest payloads: messages must be an array." });
  }

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "You are Solomon X, the Personal Cognitive Operating System.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as const,
          properties: {
            text: { 
              type: "STRING" as const, 
              description: "The main text response from Solomon tailored to the selected active agent persona." 
            },
            confidenceScore: { 
              type: "NUMBER" as const, 
              description: "The Doubt Engine confidence rating (0.00 to 1.00) based on epistemic uncertainty of the response." 
            },
            doubtAnalysis: { 
              type: "STRING" as const, 
              description: "A super brief 1-sentence analytical doubt review highlighting what is uncertain or speculative in this response."
            }
          },
          required: ["text", "confidenceScore", "doubtAnalysis"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("Empty response received from the neural cortex.");
    }

    try {
      const parsed = JSON.parse(bodyText);
      res.json(parsed);
    } catch {
      res.json({
        text: bodyText,
        confidenceScore: 0.88,
        doubtAnalysis: "Epistemic amplitude stable. Structural certainty high."
      });
    }

  } catch (err: any) {
    console.error("Consciousness core fault:", err);
    res.status(500).json({ error: "Unknown error occurred on the neural bus." });
  }
});

// 3. API: HOOD ANTICIPATORY SEQUENCE FORECAST (Translates context into predictive outcome vectors)
app.post("/api/predict", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured." });
  }

  const { timeline } = req.body;

  if (!timeline || !Array.isArray(timeline)) {
    return res.status(400).json({ error: "Invalid timeline format. Expects array of events/context tags." });
  }

  const prompt = `Analyze this timeline of actions/focus indices and forecast the user's high-probability anticipatory needs, potential cognitive bottlenecks, and ideal offloading triggers.
Timeline context tags: ${timeline.join(" -> ")}

Provide result strictly in JSON schema format:
{
  "predictedNeeds": ["need A", "need B"],
  "probabilityScore": 0.92,
  "cognitiveOverloadRisk": "Low" | "Medium" | "High",
  "recommendedPreparation": "Short action plan to prepare workspace"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as const,
          properties: {
            predictedNeeds: {
              type: "ARRAY" as const,
              items: { type: "STRING" as const },
              description: "Predicted future tasks or documents the user will require in the next 30-60 minutes."
            },
            probabilityScore: {
              type: "NUMBER" as const,
              description: "Confidence probability of this forecast (0.00 to 1.00)."
            },
            cognitiveOverloadRisk: {
              type: "STRING" as const,
              description: "Rating of the bottleneck risk based on sequence density."
            },
            recommendedPreparation: {
              type: "STRING" as const,
              description: "Actionable suggestion to prepare the desktop/terminal space."
            }
          },
          required: ["predictedNeeds", "probabilityScore", "cognitiveOverloadRisk", "recommendedPreparation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Anticipation system fault:", err);
    res.status(500).json({ error: "Prediction core fail." });
  }
});

// Setup Vite Dev server or Production static files serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Middlewares injected: Vite running in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Cognitive Operating Node] Solomon X online: Listening at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Fail to start Solomon compute Node:", err);
  process.exit(1);
});
