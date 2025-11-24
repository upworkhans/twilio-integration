import { json } from '@/lib/http';
import { logs } from '@/lib/memory';

export async function GET() {
  return json({ items: logs.list() });
}


