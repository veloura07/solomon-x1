import { randomUUID } from "node:crypto";
import { createEvent, type AgentRequest, type AgentResponse, type AgentSpecs, type BaseEvent } from "./contracts";
import { EventBus } from "./eventBus";

export interface Agent {
  readonly specs: AgentSpecs;
  handle(request: AgentRequest): Promise<AgentResponse>;
}

export interface AgentSelectionPayload {
  taskId: string;
  role: string;
  intent: string;
  data: Record<string, unknown>;
  stepIndex?: number;
}

export class AgentRegistry {
  private readonly agents = new Map<string, Agent>();

  register(agent: Agent): void {
    this.agents.set(agent.specs.name, agent);
  }

  resolve(role: string): Agent | undefined {
    if (this.agents.has(role)) {
      return this.agents.get(role);
    }

    const lower = role.toLowerCase();
    for (const agent of this.agents.values()) {
      if (agent.specs.capabilities.some((capability) => capability.toLowerCase() === lower)) {
        return agent;
      }
    }

    return undefined;
  }

  list(): AgentSpecs[] {
    return [...this.agents.values()].map((agent) => agent.specs);
  }
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

class ScriptedAgent implements Agent {
  constructor(
    public readonly specs: AgentSpecs,
    private readonly handler: (request: AgentRequest) => Promise<AgentResponse>,
  ) {}

  async handle(request: AgentRequest): Promise<AgentResponse> {
    await wait(20 + Math.floor(Math.random() * 20));
    return this.handler(request);
  }
}

export const createDefaultAgents = (): Agent[] => [
  new ScriptedAgent(
    {
      name: "Architect",
      description: "Plans the shape of a task before implementation",
      capabilities: ["plan", "architecture"],
      model: "local-architect",
      priority: 90,
    },
    async (request) => ({
      success: true,
      output: {
        plan: `Architect mapped task ${request.taskId} into a safe execution path.`,
        nextStep: request.intent,
      },
      metrics: { confidence: 0.86 },
    }),
  ),
  new ScriptedAgent(
    {
      name: "Engineer",
      description: "Produces concrete implementation steps and code",
      capabilities: ["write_code", "debug", "implement"],
      model: "local-engineer",
      priority: 100,
    },
    async (request) => ({
      success: true,
      output: {
        patch: `// Engineer draft for ${request.intent}\nexport const taskId = ${JSON.stringify(request.taskId)};`,
        notes: ["Generated implementation draft", "Ready for verification"],
      },
      metrics: { tokens: 128 },
    }),
  ),
  new ScriptedAgent(
    {
      name: "Verifier",
      description: "Runs checks and validates outputs",
      capabilities: ["verify", "test"],
      model: "local-verifier",
      priority: 80,
    },
    async (request) => ({
      success: true,
      output: {
        verified: true,
        checks: ["schema", "consistency", "style"],
        subject: request.data,
      },
      metrics: { checks: 3 },
    }),
  ),
  new ScriptedAgent(
    {
      name: "Critic",
      description: "Breaks weak plans and exposes hidden defects",
      capabilities: ["critique", "review"],
      model: "local-critic",
      priority: 70,
    },
    async (request) => ({
      success: true,
      output: {
        critique: `Critic reviewed ${request.intent} and found no blocking issues.`,
        concerns: [] as string[],
      },
      metrics: { severity: 0.2 },
    }),
  ),
  new ScriptedAgent(
    {
      name: "Guardian",
      description: "Checks permissions and safety constraints",
      capabilities: ["permission", "safety"],
      model: "local-guardian",
      priority: 75,
    },
    async (request) => ({
      success: true,
      output: {
        allowed: true,
        policy: "default",
        task: request.taskId,
      },
      metrics: { policyChecks: 1 },
    }),
  ),
  new ScriptedAgent(
    {
      name: "Companion",
      description: "Explains results back to the user",
      capabilities: ["explain", "respond"],
      model: "local-companion",
      priority: 60,
    },
    async (request) => ({
      success: true,
      output: {
        response: `Companion summarized ${request.intent} for task ${request.taskId}.`,
      },
      metrics: { clarity: 0.92 },
    }),
  ),
];

interface WorkflowState {
  taskId: string;
  stepIndex: number;
}

export class AgentOrchestrator {
  constructor(
    private readonly bus: EventBus,
    private readonly registry: AgentRegistry,
  ) {}

  start(): () => void {
    return this.bus.subscribe(
      ["AGENT_SELECTION"],
      async (event: BaseEvent<"AGENT_SELECTION", AgentSelectionPayload>) => {
        const payload = event.payload;
        const agent = this.registry.resolve(payload.role);
        if (!agent) {
          await this.bus.publish(
            createEvent(
              "AGENT_RESPONSE",
              {
                success: false,
                error: `No agent registered for role ${payload.role}`,
                taskId: payload.taskId,
              },
              event.id,
            ),
          );
          return;
        }

        const startedAt = Date.now();
        await this.bus.publish(
          createEvent(
            "AGENT_STATE",
            {
              agent: agent.specs.name,
              state: "running",
              taskId: payload.taskId,
            },
            event.id,
          ),
        );

        let response: AgentResponse;
        try {
          response = await agent.handle({
            taskId: payload.taskId,
            intent: payload.intent,
            data: payload.data,
          });
        } catch (error) {
          response = {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }

        const durationMs = Date.now() - startedAt;
        await this.bus.publish(
          createEvent(
            "AGENT_RESPONSE",
            {
              ...response,
              taskId: payload.taskId,
              agent: agent.specs.name,
              durationMs,
            },
            event.id,
          ),
        );

        await this.bus.publish(
          createEvent(
            "AGENT_STATE",
            {
              agent: agent.specs.name,
              state: response.success ? "finished" : "failed",
              taskId: payload.taskId,
            },
            event.id,
          ),
        );

      },
      { priority: 50 },
    );
  }
}
