import type { BaseEvent, EventType, KernelLogger } from "./contracts";

export type EventHandler<E extends BaseEvent = BaseEvent> = (event: E) => void | Promise<void>;

export interface SubscribeOptions {
  priority?: number;
  retries?: number;
  async?: boolean;
}

interface InternalSubscription {
  id: number;
  types: readonly EventType[];
  handler: EventHandler;
  priority: number;
  retries: number;
  async: boolean;
}

const defaultLogger: KernelLogger = {
  info(message, details) {
    console.info(message, details ?? {});
  },
  warn(message, details) {
    console.warn(message, details ?? {});
  },
  error(message, details) {
    console.error(message, details ?? {});
  },
};

export class EventBus {
  private subscriptions = new Set<InternalSubscription>();
  private sequence = 0;
  private readonly logger: KernelLogger;

  constructor(logger: KernelLogger = defaultLogger) {
    this.logger = logger;
  }

  subscribe<E extends BaseEvent>(
    types: readonly E["type"][],
    handler: EventHandler<E>,
    options: SubscribeOptions = {},
  ): () => void {
    const subscription: InternalSubscription = {
      id: ++this.sequence,
      types: [...types] as readonly EventType[],
      handler: handler as EventHandler,
      priority: options.priority ?? 0,
      retries: options.retries ?? 3,
      async: options.async ?? true,
    };

    this.subscriptions.add(subscription);
    this.logger.info("event subscription registered", {
      id: subscription.id,
      types: subscription.types,
      priority: subscription.priority,
    });

    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  async publish<E extends BaseEvent>(event: E): Promise<void> {
    const matching = [...this.subscriptions].filter((subscription) => subscription.types.includes(event.type));
    const sorted = matching.sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }
      return left.id - right.id;
    });

    if (sorted.length === 0) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      queueMicrotask(() => {
        void this.dispatchSorted(event, sorted)
          .then(() => resolve())
          .catch((error) => reject(error));
      });
    });
  }

  shutdown(): void {
    this.subscriptions.clear();
    this.logger.info("event bus shutdown");
  }

  private async dispatchSorted<E extends BaseEvent>(event: E, subscriptions: InternalSubscription[]): Promise<void> {
    for (const subscription of subscriptions) {
      if (subscription.async) {
        void this.dispatchWithRetry(subscription, event).catch((error) => {
          this.logger.error("event handler failed", {
            eventType: event.type,
            eventId: event.id,
            error: error instanceof Error ? error.message : String(error),
          });
        });
        continue;
      }

      await this.dispatchWithRetry(subscription, event);
    }
  }

  private async dispatchWithRetry<E extends BaseEvent>(subscription: InternalSubscription, event: E): Promise<void> {
    let attempt = 0;
    let delayMs = 25;

    while (true) {
      try {
        await subscription.handler(event);
        return;
      } catch (error) {
        attempt += 1;
        if (attempt > subscription.retries) {
          this.logger.error("event handler exhausted retries", {
            eventType: event.type,
            eventId: event.id,
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          });
          return;
        }

        this.logger.warn("event handler retry", {
          eventType: event.type,
          eventId: event.id,
          subscriptionId: subscription.id,
          attempt,
          delayMs,
        });

        await this.delay(delayMs);
        delayMs *= 2;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
