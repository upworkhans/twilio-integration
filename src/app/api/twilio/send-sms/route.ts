import { NextRequest } from 'next/server';
import { getTwilioClient, requireEnv } from '@/lib/twilio';
import { smsSendSchema } from '@/lib/validators';
import { badRequest, getRequestIp, json, tooManyRequests } from '@/lib/http';
import { tokenBucketAllow } from '@/lib/rateLimit';
import { logs } from '@/lib/memory';
import { claimFeatureSlot, formatFeatureThrottleMessage } from '@/lib/featureThrottle';

export async function POST(req: NextRequest) {
  try {
    const ip = getRequestIp(req);
    const throttle = claimFeatureSlot(ip);
    if (!throttle.allowed) {
      return json({ error: formatFeatureThrottleMessage(throttle.retryAfterMs) }, 429);
    }
    if (!tokenBucketAllow(`send-sms:${ip}`, 12, 6)) {
      return tooManyRequests();
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Invalid JSON body';
      logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error } });
      return badRequest(`Failed to parse request body: ${error}`);
    }

    const parsed = smsSendSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') || 'Invalid input';
      logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error: errorMsg, issues: parsed.error.issues } });
      return badRequest(errorMsg);
    }

    let twilio;
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID || '';
      const token = process.env.TWILIO_AUTH_TOKEN || '';

      twilio = getTwilioClient();
    } catch (err: any) {
      const error = err instanceof Error ? err.message : 'Failed to initialize Twilio client';
      logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error } });
      return json({ error, details: err?.stack || String(err) }, 500);
    }

    let from;
    try {
      from = requireEnv('TWILIO_PHONE_NUMBER');
    } catch (err: any) {
      const error = err instanceof Error ? err.message : 'Missing TWILIO_PHONE_NUMBER';
      logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error } });
      return json({ error, details: err?.stack || String(err) }, 500);
    }

    const { to, body: messageBody, mediaUrl } = parsed.data;

    try {
      const message = await twilio.messages.create({
        from,
        to,
        body: messageBody,
        ...(mediaUrl ? { mediaUrl: [mediaUrl] } : {}),
      });

      logs.push({ ts: Date.now(), type: 'action', event: 'send-sms', data: { to, sid: message.sid } });
      return json({ sid: message.sid, status: message.status });
    } catch (err: any) {
      const error = err instanceof Error ? err.message : 'Twilio API error';
      const details = err?.stack || err?.toString() || String(err);
      const twilioError = err?.code ? { code: err.code, status: err.status, moreInfo: err.moreInfo } : {};
      logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error, details, twilioError } });
      return json({
        error,
        details,
        twilioError,
        message: err?.message || 'Unknown error'
      }, 500);
    }
  } catch (err: any) {
    const error = err instanceof Error ? err.message : 'Unexpected server error';
    const details = err?.stack || err?.toString() || String(err);
    logs.push({ ts: Date.now(), type: 'error', event: 'send-sms', data: { error, details } });
    return json({ error, details, message: err?.message || 'Unknown error' }, 500);
  }
}


