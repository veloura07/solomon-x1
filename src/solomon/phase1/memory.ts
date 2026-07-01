import { randomUUID } from "node:crypto";

export interface MemoryLayer<T> {
  add(entry: T, metadata?: Record<string, unknown>): Promise<string>;
  query(predicate?: (entry: T) => boolean): Promise<T[]>;
  decay?(): Promise<void>;
  summarize?(): Promise<string>;
}

export interface MemoryRecord<T> {
  id: string;
  value: T;
  createdAt: string;
  updatedAt: string;
  hits: number;
  metadata: Record<string, unknown>;
}

export class L1Cache<T> implements MemoryLayer<T> {
  private readonly records = new Map<string, MemoryRecord<T>>();

  constructor(private readonly maxSize = 256) {}

  async add(entry: T, metadata: Record<string, unknown> = {}): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const record: MemoryRecord<T> = {
      id,
      value: entry,
      createdAt: now,
      updatedAt: now,
      hits: 0,
      metadata,
    };

    if (this.records.size >= this.maxSize) {
      const oldest = this.records.keys().next().value as string | undefined;
      if (oldest) {
        this.records.delete(oldest);
      }
    }

    this.records.set(id, record);
    return id;
  }

  async query(predicate: (entry: T) => boolean = () => true): Promise<T[]> {
    const results: T[] = [];
    for (const record of this.records.values()) {
      if (predicate(record.value)) {
        record.hits += 1;
        record.updatedAt = new Date().toISOString();
        results.push(record.value);
      }
    }
    return results;
  }

  async decay(): Promise<void> {
    for (const [id, record] of this.records.entries()) {
      const expiry = record.metadata.expiresAt;
      if (typeof expiry === "string" && Date.parse(expiry) < Date.now()) {
        this.records.delete(id);
      }
    }
  }

  async summarize(): Promise<string> {
    return `L1 cache contains ${this.records.size} hot memory entries`;
  }
}

export interface ConversationTurn {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
}

export interface ConversationQuery {
  userId?: string;
  after?: string;
  before?: string;
}

export class L2Conversation implements MemoryLayer<ConversationTurn> {
  private readonly turns: ConversationTurn[] = [];

  async add(entry: ConversationTurn): Promise<string> {
    const turn = { ...entry, id: entry.id ?? randomUUID() };
    this.turns.push(turn);
    return turn.id;
  }

  async query(predicate: (entry: ConversationTurn) => boolean = () => true): Promise<ConversationTurn[]> {
    return this.turns.filter(predicate);
  }

  async queryConversation(filter: ConversationQuery = {}): Promise<ConversationTurn[]> {
    return this.turns.filter((turn) => {
      if (filter.userId && turn.userId !== filter.userId) {
        return false;
      }
      if (filter.after && turn.ts <= filter.after) {
        return false;
      }
      if (filter.before && turn.ts >= filter.before) {
        return false;
      }
      return true;
    });
  }

  async summarize(): Promise<string> {
    return `L2 conversation memory stores ${this.turns.length} turns`;
  }
}

export class MemoryManager {
  constructor(
    private readonly hot: L1Cache<unknown> = new L1Cache<unknown>(),
    private readonly conversation: L2Conversation = new L2Conversation(),
  ) {}

  async remember(entry: unknown, metadata: Record<string, unknown> = {}): Promise<string> {
    const id = await this.hot.add(entry, metadata);
    if (typeof entry === "object" && entry !== null && "userId" in entry && "content" in entry) {
      const typed = entry as ConversationTurn;
      await this.conversation.add({
        id,
        userId: typed.userId,
        role: typed.role,
        content: typed.content,
        ts: typed.ts,
      });
    }
    return id;
  }

  async recall(predicate: (entry: unknown) => boolean = () => true): Promise<unknown[]> {
    return this.hot.query(predicate);
  }

  async retrieveConversation(filter: ConversationQuery = {}): Promise<ConversationTurn[]> {
    return this.conversation.queryConversation(filter);
  }
}
