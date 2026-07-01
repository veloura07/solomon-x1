import { describe, expect, it } from "vitest";
import { EventBus } from "./eventBus";
import { createEvent, type BaseEvent, type LearningPayload } from "./contracts";
import { startKernel } from "./runtime";

const waitFor = async (predicate: () => boolean, timeoutMs = 1000): Promise<void> => {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

describe("EventBus", () => {
  it("retries a failing handler before succeeding", async () => {
    const bus = new EventBus();
    let attempts = 0;

    bus.subscribe(
      ["USER_MESSAGE"],
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("transient failure");
        }
      },
      { retries: 3, async: false },
    );

    await bus.publish(
      createEvent("USER_MESSAGE", {
        userId: "retry-user",
        content: "retry the handler",
      }),
    );

    expect(attempts).toBe(3);
  });
});

describe("Solomon kernel", () => {
  it("turns a user message into a completed task", async () => {
    const kernel = await startKernel();
    const completions: Array<BaseEvent<"TASK_COMPLETED", LearningPayload>> = [];

    const unsubscribe = kernel.bus.subscribe(
      ["TASK_COMPLETED"],
      async (event: BaseEvent<"TASK_COMPLETED", LearningPayload>) => {
        completions.push(event);
      },
      { async: false },
    );

    const task = await kernel.dispatchUserMessage({
      userId: "demo-user",
      content: "Please write code for a hello world script",
    });

    await waitFor(() => completions.length > 0);
    const tasks = await kernel.tasks.listTasks({});
    const completed = tasks.find((record) => record.id === task.id);
    const report = await kernel.learning.evaluate();

    expect(completed?.status).toBe("COMPLETED");
    expect(completions[0]?.payload.taskId).toBe(task.id);
    expect(report.totalTasks).toBeGreaterThan(0);
    expect(report.successRate).toBe(1);

    unsubscribe();
    kernel.shutdown();
  });
});
