import { NextRequest } from 'next/server';
import { json, badRequest } from '@/lib/http';
import { addMessage, getConversation } from '@/lib/memory';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return badRequest('Invalid body');
  const { conversationId, username, message } = body as { 
    conversationId?: string; 
    username?: string; 
    message?: string;
  };
  
  if (!conversationId || !username || !message) {
    return badRequest('Missing conversationId, username, or message');
  }
  
  if (message.trim() === '') return badRequest('Message cannot be empty');
  
  const conv = getConversation(conversationId);
  if (!conv) return json({ error: 'Conversation not found' }, 404);
  
  if (username !== conv.user1 && username !== conv.user2) {
    return badRequest('Username not part of this conversation');
  }
  
  const msg = addMessage(conversationId, username, message.trim());
  if (!msg) return json({ error: 'Failed to add message' }, 500);
  
  return json({ id: msg.id, username: msg.username, message: msg.message, ts: msg.ts });
}

