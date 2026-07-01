import { randomUUID } from "node:crypto";
import { createEvent, type BaseEvent, type EventType, type TaskRecord, type TaskStatus } from "./contracts";
import { EventBus } from "./eventBus";

const taskRank: Record<TaskStatus, number> = {
  PENDING: 0,
  PLANNING: 1,
  RUNNING: 2,
  WAITING: 3,
  COMPLETED: 4,
  FAILED: 4,
  CANCELLED: 5,
};

export interface CreateTaskInput {
  type: string;
  metadata?: Record<string, unknown>;
}

export class TaskManager {
  private readonly tasks = new Map<string, TaskRecord>();

  constructor(private readonly bus: EventBus) {}

  async createTask(rootEventId: string, input: CreateTaskInput): Promise<TaskRecord> {
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: randomUUID(),
      rootEventId,
      type: input.type,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      metadata: {
        ...(input.metadata ?? {}),
      },
    };

    this.tasks.set(task.id, task);
    await this.bus.publish(createEvent("TASK_CREATED", task, rootEventId));
    return task;
  }

  async updateTask(taskId: string, status: TaskStatus, metadata: Record<string, unknown> = {}): Promise<TaskRecord> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (taskRank[status] < taskRank[task.status]) {
      throw new Error(`Cannot move task ${taskId} backwards from ${task.status} to ${status}`);
    }

    const updated: TaskRecord = {
      ...task,
      status,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...task.metadata,
        ...metadata,
      },
    };

    this.tasks.set(taskId, updated);
    await this.bus.publish(createEvent("TASK_UPDATED", updated, task.rootEventId));
    return updated;
  }

  async cancelTask(taskId: string): Promise<TaskRecord> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const cancelled = await this.updateTask(taskId, "CANCELLED", { cancelled: true });
    await this.bus.publish(createEvent("TASK_CANCELLED", cancelled, task.rootEventId));
    return cancelled;
  }

  async getTask(taskId: string): Promise<TaskRecord | null> {
    return this.tasks.get(taskId) ?? null;
  }

  async listTasks(filter: { status?: TaskStatus; type?: string } = {}): Promise<TaskRecord[]> {
    return [...this.tasks.values()].filter((task) => {
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      if (filter.type && task.type !== filter.type) {
        return false;
      }
      return true;
    });
  }
}
