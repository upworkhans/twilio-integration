import { NextRequest, NextResponse } from 'next/server';
import { requireEnv, getPublicOrigin } from '@/lib/twilio';
import { validateTwilioSignature } from '@/lib/webhook';
import { logs } from '@/lib/memory';

export async function POST(req: NextRequest) {
  const authToken = requireEnv('TWILIO_AUTH_TOKEN');
  const url = `${process.env.NEXT_PUBLIC_APP_ORIGIN}/api/twilio/webhook/voice`;
  const origin = getPublicOrigin();

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);
  const signature = req.headers.get('x-twilio-signature') ?? undefined;

  const valid = validateTwilioSignature({ authToken, url, params, signature });
  if (!valid) {
    logs.push({ ts: Date.now(), type: 'error', event: 'webhook-voice-invalid', data: params });
    return new NextResponse('Invalid signature', { status: 401 });
  }

  logs.push({ ts: Date.now(), type: 'webhook', event: 'inbound-voice', data: params });

  const ivrActionUrl = `${origin}/api/twilio/ivr-action`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Thank you for calling Glocify customer support. Press 1 to learn about Glocify, press 2 to hear about our services, or press 3 to talk to our representative.</Say>
  <Gather input="dtmf" timeout="10" numDigits="1" action="${ivrActionUrl}" method="POST" />
  <Say>We did not receive any input. Please try again.</Say>
  <Redirect method="POST">${origin}/api/twilio/webhook/voice</Redirect>
</Response>`;
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}


