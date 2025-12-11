import { NextRequest } from 'next/server';
import { getTwilioClient, requireEnv, getPublicOrigin } from '@/lib/twilio';
import { outboundCallSchema } from '@/lib/validators';
import { badRequest, getRequestIp, json, tooManyRequests } from '@/lib/http';
import { tokenBucketAllow } from '@/lib/rateLimit';
import { logs } from '@/lib/memory';
import { claimFeatureSlot, formatFeatureThrottleMessage } from '@/lib/featureThrottle';

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const throttle = claimFeatureSlot(ip, ip);
  if (!throttle.allowed) {
    return json({ error: formatFeatureThrottleMessage(throttle.retryAfterMs) }, 429);
  }
  if (!tokenBucketAllow(`call:${ip}`, 6, 3, ip)) return tooManyRequests();

  const body = await req.json().catch(() => null);
  const parsed = outboundCallSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

  const { to, record } = parsed.data;
  const from = requireEnv('TWILIO_PHONE_NUMBER');
  const client = getTwilioClient();
  const origin = getPublicOrigin();

  try {
    const call = await client.calls.create({
      from,
      to,
      record: record ? true : undefined,
      recordingStatusCallback: record ? `${origin}/api/twilio/webhook/voice` : undefined,
      url: `${origin}/api/twilio/webhook/voice`,
    });
    logs.push({ ts: Date.now(), type: 'action', event: 'outbound-call', data: { to, sid: call.sid } });
    return json({ sid: call.sid, status: call.status });
  } catch (err: any) {
    logs.push({ ts: Date.now(), type: 'error', event: 'outbound-call', data: { message: err?.message } });
    return badRequest(err?.message || 'Twilio error');
  }
}


