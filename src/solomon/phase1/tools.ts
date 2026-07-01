import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createEvent, type PermissionLevel, type Tool, type ToolExecutionContext, type ToolResult, type BaseEvent } from "./contracts";
import { EventBus } from "./eventBus";

const permissionRank: Record<PermissionLevel, number> = {
  USER: 0,
  ADMIN: 1,
  SYSTEM: 2,
};

const principalClearance: Record<string, PermissionLevel> = {
  user: "USER",
  assistant: "ADMIN",
  admin: "ADMIN",
  system: "SYSTEM",
};

const hasPermission = (required: PermissionLevel, principal: string): boolean => {
  const level = principalClearance[principal.toLowerCase()] ?? "USER";
  return permissionRank[level] >= permissionRank[required];
};

export class ToolRouter {
  private readonly tools = new Map<string, Tool>();

  constructor(private readonly bus: EventBus) {}

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  listTools(): Tool[] {
    return [...this.tools.values()];
  }

  start(): () => void {
    return this.bus.subscribe(
      ["TOOL_EXECUTION_REQUEST"],
      async (event: BaseEvent<"TOOL_EXECUTION_REQUEST", { taskId: string; toolName: string; input: unknown; principal?: string; timeoutMs?: number }>) => {
        const payload = event.payload;
        const tool = this.tools.get(payload.toolName);
        if (!tool) {
          await this.bus.publish(
            createEvent(
              "TOOL_EXECUTION_RESPONSE",
              {
                success: false,
                error: `Tool ${payload.toolName} not registered`,
                taskId: payload.taskId,
              },
              event.id,
            ),
          );
          return;
        }

        const principal = payload.principal ?? "system";
        if (!hasPermission(tool.requiredPermission, principal)) {
          await this.bus.publish(
            createEvent(
              "TOOL_EXECUTION_RESPONSE",
              {
                success: false,
                error: `Principal ${principal} lacks ${tool.requiredPermission} permission`,
                taskId: payload.taskId,
              },
              event.id,
            ),
          );
          return;
        }

        const result = await this.runWithTimeout(tool, payload.input, {
          taskId: payload.taskId,
          principal,
        }, payload.timeoutMs ?? 30_000);

        await this.bus.publish(
          createEvent(
            "TOOL_EXECUTION_RESPONSE",
            {
              ...result,
              taskId: payload.taskId,
              toolName: payload.toolName,
            },
            event.id,
          ),
        );
      },
      { priority: 40 },
    );
  }

  async runWithTimeout(
    tool: Tool,
    input: unknown,
    context: ToolExecutionContext,
    timeoutMs: number,
  ): Promise<ToolResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await Promise.race<ToolResult>([
        tool.execute(input, {
          ...context,
          abortSignal: context.abortSignal ?? controller.signal,
        }),
        new Promise<ToolResult>((resolve) => {
          controller.signal.addEventListener("abort", () => {
            resolve({ success: false, error: `Tool ${tool.name} timed out after ${timeoutMs}ms` });
          });
        }),
      ]);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const createDefaultTools = (): Tool[] => [
  {
    name: "filesystem",
    description: "Read and write files relative to the Solomon workspace",
    requiredPermission: "SYSTEM",
    async execute(input: unknown): Promise<ToolResult> {
      const payload = input as { operation: "read" | "write"; filepath: string; content?: string };
      const target = resolve(payload.filepath);
      if (payload.operation === "read") {
        const data = await readFile(target, "utf8");
        return { success: true, data };
      }

      if (payload.content === undefined) {
        return { success: false, error: "Missing content for file write" };
      }

      await writeFile(target, payload.content, "utf8");
      return { success: true, data: { filepath: target } };
    },
  },
  {
    name: "notes",
    description: "Append structured notes to the learning buffer",
    requiredPermission: "ADMIN",
    async execute(input: unknown): Promise<ToolResult> {
      return {
        success: true,
        data: {
          recorded: true,
          input,
        },
      };
    },
  },
];
