import { NextRequest } from 'next/server';
import { json, badRequest } from '@/lib/http';
import { createConversation, getConversation } from '@/lib/memory';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return badRequest('Invalid body');
  const { user1, user2 } = body as { user1?: string; user2?: string };
  if (!user1 || !user2) return badRequest('Missing user1 or user2');
  if (user1.trim() === '' || user2.trim() === '') return badRequest('Usernames cannot be empty');
  
  const conv = createConversation(user1.trim(), user2.trim());
  return json({ conversationId: conv.id, user1: conv.user1, user2: conv.user2 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('id');
  if (!conversationId) return badRequest('Missing conversation id');
  
  const conv = getConversation(conversationId);
  if (!conv) return json({ error: 'Conversation not found' }, 404);
  
  return json({ 
    id: conv.id, 
    user1: conv.user1, 
    user2: conv.user2, 
    createdAt: conv.createdAt,
    messages: conv.messages 
  });
}

