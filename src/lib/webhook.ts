import Twilio from 'twilio';

export function validateTwilioSignature({
  authToken,
  url,
  params,
  signature,
}: {
  authToken: string;
  url: string;
  params: Record<string, string>;
  signature: string | undefined;
}): boolean {
  if (!signature) return false;
  return Twilio.validateRequest(authToken, signature, url, params);
}


