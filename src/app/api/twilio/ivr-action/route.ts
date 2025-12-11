import { NextRequest, NextResponse } from 'next/server';
import { requireEnv, getPublicOrigin } from '@/lib/twilio';
import { validateTwilioSignature } from '@/lib/webhook';
import { logs } from '@/lib/memory';

export async function POST(req: NextRequest) {
  const authToken = requireEnv('TWILIO_AUTH_TOKEN');
  const url = `${process.env.NEXT_PUBLIC_APP_ORIGIN}/api/twilio/ivr-action`;
  const origin = getPublicOrigin();

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);
  const signature = req.headers.get('x-twilio-signature') ?? undefined;

  const valid = validateTwilioSignature({ authToken, url, params, signature });
  if (!valid) {
    logs.push({ ts: Date.now(), type: 'error', event: 'ivr-action-invalid', data: params });
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const digits = params.Digits || '';
  const supportNumber = process.env.TWILIO_SUPPORT_AGENT_NUMBER || process.env.TWILIO_PHONE_NUMBER || '';
  const webhookUrl = `${origin}/api/twilio/webhook/voice`;
  let twiml = '';

  if (digits === '1') {
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Glocify builds customer engagement tools that bring voice, video, and messaging together so your business can grow faster.</Say>
  <Pause length="1"/>
  <Say>We will return you to the main menu.</Say>
  <Redirect method="POST">${webhookUrl}</Redirect>
</Response>`;
  } else if (digits === '2') {
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Our services include programmable voice, secure video meetings, and automated messaging journeys tailored for your teams.</Say>
  <Pause length="1"/>
  <Say>Returning to the main menu.</Say>
  <Redirect method="POST">${webhookUrl}</Redirect>
</Response>`;
  } else if (digits === '3' && supportNumber) {
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Connecting you to a Glocify representative.</Say>
  <Dial timeout="25" action="${origin}/api/twilio/ivr-action?DialCallStatus=completed" method="POST">
    <Number>${supportNumber}</Number>
  </Dial>
  <Say>All representatives are busy right now. Please try again later.</Say>
  <Redirect method="POST">${webhookUrl}</Redirect>
</Response>`;
  } else {
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Sorry, that was not a valid option. Please try again.</Say>
  <Redirect method="POST">${webhookUrl}</Redirect>
</Response>`;
  }

  logs.push({ ts: Date.now(), type: 'webhook', event: 'ivr-action', data: { digits, supportNumber: digits === '3' ? supportNumber : undefined } });
  return new NextResponse(twiml, { status: 200, headers: { 'Content-Type': 'application/xml' } });
}


