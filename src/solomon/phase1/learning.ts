import { createEvent, type BaseEvent, type LearningPayload, type LearningReport } from "./contracts";
import { EventBus } from "./eventBus";

export class LearningEngine {
  private readonly records: LearningPayload[] = [];

  constructor(private readonly bus: EventBus) {}

  start(): () => void {
    return this.bus.subscribe(
      ["TASK_COMPLETED", "TASK_FAILED"],
      async (event: BaseEvent<"TASK_COMPLETED" | "TASK_FAILED", LearningPayload>) => {
        await this.ingest(event.payload, event.id);
      },
      { priority: 10 },
    );
  }

  async ingest(payload: LearningPayload, correlationId?: string): Promise<void> {
    this.records.push(payload);
    await this.bus.publish(
      createEvent(
        "LEARNING_INGESTED",
        {
          ...payload,
          totalRecords: this.records.length,
        },
        correlationId ?? payload.taskId,
      ),
    );
  }

  async evaluate(): Promise<LearningReport> {
    const totalTasks = this.records.length;
    const successCount = this.records.filter((record) => record.success).length;
    const successRate = totalTasks === 0 ? 0 : successCount / totalTasks;

    const suggestions =
      successRate < 0.8
        ? [
            "Increase verification depth before responding.",
            "Route ambiguous tasks through Architect before Engineer.",
          ]
        : ["Current Phase 1 loop is healthy. Keep the current planner/agent split."];

    return {
      totalTasks,
      successRate,
      suggestions,
    };
  }
}
