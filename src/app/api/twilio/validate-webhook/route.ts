import { NextRequest } from 'next/server';
import { json, badRequest } from '@/lib/http';
import { validateTwilioSignature } from '@/lib/webhook';
import { requireEnv } from '@/lib/twilio';

// Example endpoint to demonstrate validating a signature for a given URL and params
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return badRequest('Invalid body');
  const { url, params, signature } = body as { url?: string; params?: Record<string, string>; signature?: string };
  if (!url || !params) return badRequest('Missing url or params');
  const authToken = requireEnv('TWILIO_AUTH_TOKEN');
  const valid = validateTwilioSignature({ authToken, url, params: params || {}, signature });
  return json({ valid });
}


