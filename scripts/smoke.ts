/*
  Simple smoke test: send SMS, request Video token, trigger outbound call.
  Requires server running on localhost:3000 and .env configured.
*/
import 'node-fetch';

async function main() {
  const base = process.env.BASE_URL || 'http://localhost:3000';

  const to = process.env.TEST_PHONE_TO;
  if (!to) {
    console.log('Set TEST_PHONE_TO to run the call/sms checks');
  }

  // Video token
  {
    const res = await fetch(`${base}/api/twilio/video-token?identity=smoke`);
    const data = await res.json();
    console.log('Video token ok?', res.ok, data?.token ? 'yes' : 'no');
  }

  if (to) {
    // SMS
    {
      const res = await fetch(`${base}/api/twilio/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body: 'Smoke test from demo' }),
      });
      console.log('Send SMS ok?', res.ok);
    }

    // Outbound call (no recording)
    {
      const res = await fetch(`${base}/api/twilio/outbound-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, record: false }),
      });
      console.log('Outbound call ok?', res.ok);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


