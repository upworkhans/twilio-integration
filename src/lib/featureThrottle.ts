import { enforceCooldown } from './rateLimit';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export function claimFeatureSlot(identifier: string) {
  return enforceCooldown(`feature:${identifier}`, TEN_MINUTES_MS);
}

export function formatFeatureThrottleMessage(retryAfterMs: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterMs / 60000));
  return `Please wait ${minutes} minute${minutes === 1 ? '' : 's'} before testing another Twilio action.`;
}

