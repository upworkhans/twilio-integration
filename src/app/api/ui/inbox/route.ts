import { json } from '@/lib/http';
import { smsInbox } from '@/lib/memory';

export async function GET() {
  return json({ items: smsInbox.list() });
}


