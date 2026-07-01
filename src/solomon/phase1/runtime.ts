import { randomUUID } from "node:crypto";
import {
  createEvent,
  type AgentResponse,
  type BaseEvent,
  type LearningPayload,
  type PlannerResult,
  type TaskRecord,
  type TaskStatus,
  type UserMessagePayload,
} from "./contracts";
import { EventBus } from "./eventBus";
import { TaskManager } from "./taskManager";
import { MemoryManager } from "./memory";
import { SimplePlanner } from "./planner";
import { AgentOrchestrator, AgentRegistry, createDefaultAgents } from "./agents";
import { LearningEngine } from "./learning";
import { ToolRouter, createDefaultTools } from "./tools";

interface WorkflowState {
  taskId: string;
  plan: PlannerResult;
  stepIndex: number;
  outputs: unknown[];
  lastAgentResponse?: AgentResponse;
  lastToolResponse?: unknown;
}

export interface SolomonKernel {
  bus: EventBus;
  tasks: TaskManager;
  memory: MemoryManager;
  planner: SimplePlanner;
  agents: AgentRegistry;
  tools: ToolRouter;
  learning: LearningEngine;
  dispatchUserMessage(payload: UserMessagePayload): Promise<TaskRecord>;
  snapshot(): Promise<KernelSnapshot>;
  shutdown(): void;
}

export interface KernelSnapshot {
  generatedAt: string;
  taskCounts: {
    total: number;
    pending: number;
    planning: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  agentCount: number;
  toolNames: string[];
  memoryCounts: {
    hotEntries: number;
    conversationTurns: number;
  };
  learning: {
    totalTasks: number;
    successRate: number;
  };
}

export class SolomonKernelRuntime implements SolomonKernel {
  readonly bus: EventBus;
  readonly tasks: TaskManager;
  readonly memory: MemoryManager;
  readonly planner: SimplePlanner;
  readonly agents: AgentRegistry;
  readonly tools: ToolRouter;
  readonly learning: LearningEngine;

  private readonly workflows = new Map<string, WorkflowState>();
  private readonly unsubscribers: Array<() => void> = [];

  constructor() {
    this.bus = new EventBus();
    this.tasks = new TaskManager(this.bus);
    this.memory = new MemoryManager();
    this.planner = new SimplePlanner();
    this.agents = new AgentRegistry();
    this.tools = new ToolRouter(this.bus);
    this.learning = new LearningEngine(this.bus);

    for (const agent of createDefaultAgents()) {
      this.agents.register(agent);
    }

    for (const tool of createDefaultTools()) {
      this.tools.register(tool);
    }

    this.unsubscribers.push(this.registerCoreHandlers());
    this.unsubscribers.push(new AgentOrchestrator(this.bus, this.agents).start());
    this.unsubscribers.push(this.tools.start());
    this.unsubscribers.push(this.learning.start());
  }

  async dispatchUserMessage(payload: UserMessagePayload): Promise<TaskRecord> {
    const message = createEvent("USER_MESSAGE", payload);
    return this.handleUserMessage(message);
  }

  async snapshot(): Promise<KernelSnapshot> {
    const tasks = await this.tasks.listTasks({});
    const [hotEntries, conversationTurns, learningReport] = await Promise.all([
      this.memory.recall(() => true),
      this.memory.retrieveConversation({}),
      this.learning.evaluate(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      taskCounts: {
        total: tasks.length,
        pending: tasks.filter((task) => task.status === "PENDING").length,
        planning: tasks.filter((task) => task.status === "PLANNING").length,
        running: tasks.filter((task) => task.status === "RUNNING").length,
        completed: tasks.filter((task) => task.status === "COMPLETED").length,
        failed: tasks.filter((task) => task.status === "FAILED").length,
        cancelled: tasks.filter((task) => task.status === "CANCELLED").length,
      },
      agentCount: this.agents.list().length,
      toolNames: this.tools.listTools().map((tool) => tool.name),
      memoryCounts: {
        hotEntries: hotEntries.length,
        conversationTurns: conversationTurns.length,
      },
      learning: {
        totalTasks: learningReport.totalTasks,
        successRate: learningReport.successRate,
      },
    };
  }

  shutdown(): void {
    while (this.unsubscribers.length > 0) {
      const unsubscribe = this.unsubscribers.pop();
      unsubscribe?.();
    }
    this.bus.shutdown();
  }

  private registerCoreHandlers(): () => void {
    const userMessageUnsubscribe = this.bus.subscribe(
      ["USER_MESSAGE"],
      async (event: BaseEvent<"USER_MESSAGE", UserMessagePayload>) => {
        await this.handleUserMessage(event);
      },
      { priority: 100 },
    );

    const planningDoneUnsubscribe = this.bus.subscribe(
      ["PLANNING_DONE"],
      async (event: BaseEvent<"PLANNING_DONE", { taskId: string; plan: PlannerResult }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        await this.tasks.updateTask(state.taskId, "RUNNING", { plan: state.plan });
        await this.executeStep(state.taskId, 0, event.id);
      },
      { priority: 90 },
    );

    const memoryResultUnsubscribe = this.bus.subscribe(
      ["MEMORY_RESULT"],
      async (event: BaseEvent<"MEMORY_RESULT", { taskId: string; entries: unknown[]; stepIndex: number }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        state.outputs.push({ memory: event.payload.entries });
        await this.executeStep(state.taskId, event.payload.stepIndex + 1, event.id);
      },
      { priority: 80 },
    );

    const agentResponseUnsubscribe = this.bus.subscribe(
      ["AGENT_RESPONSE"],
      async (event: BaseEvent<"AGENT_RESPONSE", AgentResponse & { taskId: string; agent: string; durationMs: number }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        state.outputs.push(event.payload);
        state.lastAgentResponse = event.payload;
        await this.executeStep(state.taskId, state.stepIndex + 1, event.id);
      },
      { priority: 80 },
    );

    const toolResponseUnsubscribe = this.bus.subscribe(
      ["TOOL_EXECUTION_RESPONSE"],
      async (event: BaseEvent<"TOOL_EXECUTION_RESPONSE", { taskId: string; toolName?: string; success: boolean; data?: unknown; error?: string }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        state.outputs.push(event.payload);
        state.lastToolResponse = event.payload;
        await this.executeStep(state.taskId, state.stepIndex + 1, event.id);
      },
      { priority: 80 },
    );

    const validationUnsubscribe = this.bus.subscribe(
      ["VALIDATION_DONE"],
      async (event: BaseEvent<"VALIDATION_DONE", { taskId: string; success: boolean; details?: unknown }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        if (!event.payload.success) {
          await this.finishWorkflow(state.taskId, false, { validation: event.payload.details }, event.id);
          return;
        }

        await this.executeStep(state.taskId, state.stepIndex + 1, event.id);
      },
      { priority: 80 },
    );

    const responseReadyUnsubscribe = this.bus.subscribe(
      ["RESPONSE_READY"],
      async (event: BaseEvent<"RESPONSE_READY", { taskId: string; output?: unknown }>) => {
        const state = this.workflows.get(event.payload.taskId);
        if (!state) {
          return;
        }

        const payload: LearningPayload = {
          taskId: state.taskId,
          input: state.plan,
          output: event.payload.output ?? state.lastAgentResponse ?? state.lastToolResponse ?? state.outputs,
          success: true,
          metrics: {
            steps: state.plan.steps.length,
          },
        };

        await this.tasks.updateTask(state.taskId, "COMPLETED", { result: payload.output });
        await this.bus.publish(createEvent("TASK_COMPLETED", payload, event.id));
        this.workflows.delete(state.taskId);
      },
      { priority: 80 },
    );

    const failureUnsubscribe = this.bus.subscribe(
      ["TASK_FAILED"],
      async (event: BaseEvent<"TASK_FAILED", LearningPayload>) => {
        this.workflows.delete(event.payload.taskId);
      },
      { priority: 20 },
    );

    return () => {
      userMessageUnsubscribe();
      planningDoneUnsubscribe();
      memoryResultUnsubscribe();
      agentResponseUnsubscribe();
      toolResponseUnsubscribe();
      validationUnsubscribe();
      responseReadyUnsubscribe();
      failureUnsubscribe();
    };
  }

  private async handleUserMessage(event: BaseEvent<"USER_MESSAGE", UserMessagePayload>): Promise<TaskRecord> {
    const task = await this.tasks.createTask(event.id, {
      type: "USER_QUERY",
      metadata: {
        userId: event.payload.userId,
        content: event.payload.content,
        ...(event.payload.metadata ?? {}),
      },
    });

    const plan = await this.planner.plan(event);
    this.workflows.set(task.id, {
      taskId: task.id,
      plan,
      stepIndex: 0,
      outputs: [],
    });

    await this.tasks.updateTask(task.id, "PLANNING", { plan });
    await this.bus.publish(createEvent("PLANNING_DONE", { taskId: task.id, plan }, event.id));
    return task;
  }

  private async executeStep(taskId: string, stepIndex: number, correlationId?: string): Promise<void> {
    const state = this.workflows.get(taskId);
    if (!state) {
      return;
    }

    state.stepIndex = stepIndex;
    const step = state.plan.steps[stepIndex];
    if (!step) {
      await this.finishWorkflow(taskId, true, { outputs: state.outputs }, correlationId);
      return;
    }

    switch (step.type) {
      case "MEMORY_RETRIEVE": {
        const userId = String(step.params.userId ?? state.taskId);
        const entries = await this.memory.retrieveConversation({ userId });
        await this.bus.publish(createEvent("MEMORY_RESULT", { taskId, entries, stepIndex }, correlationId));
        return;
      }
      case "SELECT_AGENT": {
        await this.bus.publish(
          createEvent(
            "AGENT_SELECTION",
            {
              taskId,
              role: String(step.params.role ?? "Architect"),
              intent: String(step.params.intent ?? "plan"),
              data: {
                step,
                outputs: state.outputs,
              },
              stepIndex,
            },
            correlationId,
          ),
        );
        return;
      }
      case "CALL_TOOL": {
        await this.bus.publish(
          createEvent(
            "TOOL_EXECUTION_REQUEST",
            {
              taskId,
              toolName: String(step.params.tool ?? "filesystem"),
              input: step.params.input ?? {},
              principal: String(step.params.principal ?? "system"),
              timeoutMs: Number(step.params.timeoutMs ?? 30_000),
            },
            correlationId,
          ),
        );
        return;
      }
      case "VALIDATE": {
        const success = state.outputs.length > 0;
        await this.bus.publish(
          createEvent(
            "VALIDATION_DONE",
            {
              taskId,
              success,
              details: {
                outputs: state.outputs,
              },
            },
            correlationId,
          ),
        );
        return;
      }
      case "RESPOND": {
        const output = state.outputs.at(-1) ?? {
          summary: "No explicit output captured",
        };
        await this.bus.publish(createEvent("RESPONSE_READY", { taskId, output }, correlationId));
        return;
      }
      default: {
        await this.finishWorkflow(taskId, false, { error: `Unsupported step ${(step as { type: string }).type}` }, correlationId);
      }
    }
  }

  private async finishWorkflow(taskId: string, success: boolean, details: Record<string, unknown>, correlationId?: string): Promise<void> {
    const state = this.workflows.get(taskId);
    if (!state) {
      return;
    }

    if (success) {
      await this.tasks.updateTask(taskId, "COMPLETED", details);
    } else {
      await this.tasks.updateTask(taskId, "FAILED", details);
      await this.bus.publish(
        createEvent(
          "TASK_FAILED",
          {
            taskId,
            input: state.plan,
            output: details,
            success: false,
            error: String(details.error ?? "Workflow failed"),
            metrics: {
              steps: state.plan.steps.length,
            },
          },
          correlationId,
        ),
      );
    }

    if (success) {
      await this.bus.publish(
        createEvent(
          "TASK_COMPLETED",
          {
            taskId,
            input: state.plan,
            output: details,
            success: true,
            metrics: {
              steps: state.plan.steps.length,
            },
          },
          correlationId,
        ),
      );
    }

    this.workflows.delete(taskId);
  }
}

export async function startKernel(): Promise<SolomonKernel> {
  return new SolomonKernelRuntime();
}
