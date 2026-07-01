import { randomUUID } from "node:crypto";

export const EVENT_TYPES = [
  "USER_MESSAGE",
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_CANCELLED",
  "PLANNING_DONE",
  "STEP_EXECUTION",
  "MEMORY_RETRIEVE",
  "MEMORY_RESULT",
  "AGENT_SELECTION",
  "AGENT_STATE",
  "AGENT_RESPONSE",
  "TOOL_EXECUTION_REQUEST",
  "TOOL_EXECUTION_RESPONSE",
  "VALIDATION_DONE",
  "RESPONSE_READY",
  "TASK_COMPLETED",
  "TASK_FAILED",
  "LEARNING_INGESTED",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface BaseEvent<T extends EventType = EventType, P = unknown> {
  id: string;
  type: T;
  payload: P;
  ts: string;
  correlationId?: string;
}

export interface UserMessagePayload {
  userId: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export type TaskStatus =
  | "PENDING"
  | "PLANNING"
  | "RUNNING"
  | "WAITING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface TaskRecord {
  id: string;
  rootEventId: string;
  type: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface PlannerStep {
  type: "MEMORY_RETRIEVE" | "SELECT_AGENT" | "CALL_TOOL" | "VALIDATE" | "RESPOND";
  params: Record<string, unknown>;
}

export interface PlannerResult {
  steps: PlannerStep[];
  rationale: string;
}

export interface AgentSpecs {
  name: string;
  description: string;
  capabilities: string[];
  model: string;
  priority: number;
}

export interface AgentRequest {
  taskId: string;
  intent: string;
  data: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  output?: unknown;
  error?: string;
  metrics?: Record<string, number>;
}

export type PermissionLevel = "USER" | "ADMIN" | "SYSTEM";

export interface ToolExecutionContext {
  taskId: string;
  principal: string;
  abortSignal?: AbortSignal;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metrics?: Record<string, number>;
}

export interface Tool {
  name: string;
  description: string;
  requiredPermission: PermissionLevel;
  execute(input: unknown, context: ToolExecutionContext): Promise<ToolResult>;
}

export interface LearningPayload {
  taskId: string;
  input: unknown;
  output: unknown;
  success: boolean;
  error?: string;
  metrics?: Record<string, number>;
}

export interface LearningReport {
  totalTasks: number;
  successRate: number;
  suggestions: string[];
}

export interface KernelLogger {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, details?: Record<string, unknown>): void;
}

export const createEvent = <T extends EventType, P>(
  type: T,
  payload: P,
  correlationId?: string,
): BaseEvent<T, P> => ({
  id: randomUUID(),
  type,
  payload,
  ts: new Date().toISOString(),
  correlationId,
});
