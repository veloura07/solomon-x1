import { createEvent, type PlannerResult, type PlannerStep, type UserMessagePayload } from "./contracts";
import type { BaseEvent } from "./contracts";

export interface Planner {
  plan(message: BaseEvent<"USER_MESSAGE", UserMessagePayload>): Promise<PlannerResult>;
}

export class SimplePlanner implements Planner {
  async plan(message: BaseEvent<"USER_MESSAGE", UserMessagePayload>): Promise<PlannerResult> {
    const content = message.payload.content.toLowerCase();
    const steps: PlannerStep[] = [];

    if (content.includes("remember") || content.includes("memory")) {
      steps.push({ type: "MEMORY_RETRIEVE", params: { scope: "conversation", userId: message.payload.userId } });
    }

    if (content.includes("code") || content.includes("build") || content.includes("implement")) {
      steps.push({ type: "SELECT_AGENT", params: { role: "Engineer", intent: "write_code" } });
    } else if (content.includes("explain") || content.includes("why")) {
      steps.push({ type: "SELECT_AGENT", params: { role: "Companion", intent: "explain" } });
    } else if (content.includes("test") || content.includes("verify")) {
      steps.push({ type: "SELECT_AGENT", params: { role: "Verifier", intent: "verify" } });
    } else {
      steps.push({ type: "SELECT_AGENT", params: { role: "Architect", intent: "plan" } });
    }

    steps.push({ type: "VALIDATE", params: { policy: "default" } });
    steps.push({ type: "RESPOND", params: { channel: "ws" } });

    return {
      steps,
      rationale: `Planner chose ${steps.length} steps based on content cues: ${content.slice(0, 120)}`,
    };
  }
}
