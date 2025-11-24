import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/twilio';
import { validateTwilioSignature } from '@/lib/webhook';
import { logs, smsInbox } from '@/lib/memory';

export async function POST(req: NextRequest) {
  const authToken = requireEnv('TWILIO_AUTH_TOKEN');

  const url = `${process.env.NEXT_PUBLIC_APP_ORIGIN}/api/twilio/webhook/sms`;
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  const signature = req.headers.get('x-twilio-signature') ?? undefined;
  const valid = validateTwilioSignature({ authToken, url, params, signature });
  if (!valid) {
    logs.push({ ts: Date.now(), type: 'error', event: 'webhook-sms-invalid', data: params });
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const from = params.From || '';
  const to = params.To || '';
  const body = params.Body || '';
  const numMedia = Number(params.NumMedia || '0');
  const mediaUrls: string[] = [];
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`] || params[`MediaUrl${i.toString()}`];
    if (url) mediaUrls.push(url);
  }

  smsInbox.push({ from, to, body, mediaUrls, ts: Date.now() });
  logs.push({ ts: Date.now(), type: 'webhook', event: 'inbound-sms', data: { from, body } });

  // Simple auto-reply TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>Thanks! Received your message.</Message>\n</Response>`;
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}


