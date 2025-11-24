import { randomUUID } from 'crypto';

export type LogEntry = {
  ts: number;
  type: 'webhook' | 'action' | 'error';
  event: string;
  data?: unknown;
};

export class LruQueue<T> {
  private buffer: T[] = [];
  constructor(private readonly capacity: number) {}
  push(item: T) {
    this.buffer.unshift(item);
    if (this.buffer.length > this.capacity) this.buffer.pop();
  }
  list(): T[] {
    return [...this.buffer];
  }
  clear() {
    this.buffer = [];
  }
}

export const logs = new LruQueue<LogEntry>(200);

export type InboundSms = {
  from: string;
  to: string;
  body: string;
  mediaUrls: string[];
  ts: number;
};

export const smsInbox = new LruQueue<InboundSms>(200);

export type ChatMessage = {
  id: string;
  conversationId: string;
  username: string;
  message: string;
  ts: number;
};

export type ChatConversation = {
  id: string;
  user1: string;
  user2: string;
  createdAt: number;
  messages: ChatMessage[];
};

const conversations = new Map<string, ChatConversation>();

export function createConversation(user1: string, user2: string): ChatConversation {
  const id = randomUUID();
  const conv: ChatConversation = {
    id,
    user1,
    user2,
    createdAt: Date.now(),
    messages: [],
  };
  conversations.set(id, conv);
  return conv;
}

export function getConversation(id: string): ChatConversation | undefined {
  return conversations.get(id);
}

export function addMessage(conversationId: string, username: string, message: string): ChatMessage | null {
  const conv = conversations.get(conversationId);
  if (!conv) return null;
  const msg: ChatMessage = {
    id: randomUUID(),
    conversationId,
    username,
    message,
    ts: Date.now(),
  };
  conv.messages.push(msg);
  return msg;
}

export function getAllConversations(): ChatConversation[] {
  return Array.from(conversations.values());
}


