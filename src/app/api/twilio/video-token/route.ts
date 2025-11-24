import { NextRequest } from 'next/server';
import { badRequest, getRequestIp, json } from '@/lib/http';
import { identitySchema } from '@/lib/validators';
import { requireEnv } from '@/lib/twilio';
import { SignJWT } from 'jose';
import { claimFeatureSlot, formatFeatureThrottleMessage } from '@/lib/featureThrottle';

export async function GET(req: NextRequest) {
  const ip = getRequestIp(req);
  const throttle = claimFeatureSlot(ip);
  if (!throttle.allowed) {
    return json({ error: formatFeatureThrottleMessage(throttle.retryAfterMs) }, 429);
  }

  const { searchParams } = new URL(req.url);
  const identity = searchParams.get('identity');
  const room = searchParams.get('room');
  const parsed = identitySchema.safeParse({ identity });
  if (!parsed.success) return badRequest('Invalid identity');

  const apiKey = requireEnv('TWILIO_API_KEY_SID');
  const apiSecret = requireEnv('TWILIO_API_KEY_SECRET');
  const accountSid = requireEnv('TWILIO_ACCOUNT_SID');

  // Build a Twilio-compatible Access Token for Video (JWT with grants)
  const now = Math.floor(Date.now() / 1000);
  const ttl = 60 * 10; // 10 minutes
  const videoGrant = room ? { room } : {};

  const payload = {
    jti: `${apiKey}-${now}`,
    iss: apiKey,
    sub: accountSid,
    exp: now + ttl,
    grants: {
      identity: parsed.data.identity,
      video: videoGrant,
    },
  } as const;

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT', cty: 'twilio-fpa;v=1' })
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(new TextEncoder().encode(apiSecret));

  return json({ token, ttl });
}


