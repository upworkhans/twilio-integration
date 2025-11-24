# Twilio India Demo (Next.js + TypeScript)

A production-minded demo showcasing Twilio Voice (inbound/outbound + recording), IVR (Gather, transfer, voicemail), Programmable Video (token issuance), and SMS/MMS (send + inbound webhook) for India-focused workflows — without any database. All state is ephemeral (in-memory) or through Twilio itself.

## Tech Stack
- Next.js App Router (TypeScript)
- Twilio Node SDK (`twilio`)
- Input validation with `zod`
- In-memory LRU logs and inbox
- Token-bucket rate limiter

## Features
- Voice: click-to-call, server-initiated outbound call, inbound webhook TwiML, optional recording
- IVR: Gather menu, transfer to agent, voicemail recording
- Video: server-issues short-lived tokens, simple client UI to fetch
- SMS/MMS: send from UI; inbound webhook populates in-memory inbox, media URLs listed
- Security: webhook signature validation; short-lived tokens; rate limiting; server-only secrets

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure environment

Create `.env.local` from the example and fill values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_PHONE_NUMBER` (E.164, e.g., +91...) — ideally Indian number for local testing
- `NEXT_PUBLIC_APP_ORIGIN` — your public HTTPS origin (ngrok URL during dev)
- `JWT_SECRET` (optional)

3) Run the dev server

```bash
npm run dev
```

4) Expose HTTPS via ngrok

```bash
# Replace 3000 if using a different port
ngrok http 3000
```

Copy the `https://...` forwarding URL and set it as `NEXT_PUBLIC_APP_ORIGIN` in `.env.local`.

5) Configure Twilio Console webhooks

- Phone Number > Voice webhook: `POST https://<ngrok>/api/twilio/webhook/voice`
- Phone Number > Messaging webhook: `POST https://<ngrok>/api/twilio/webhook/sms`

All webhooks are validated via Twilio signature using your `TWILIO_AUTH_TOKEN`.

## Pages
- `/` Dashboard
- `/voice` Voice actions (outbound call)
- `/ivr` IVR explanation
- `/video` Fetch Video token (use with Twilio Video JS SDK)
- `/sms` Send SMS/MMS, view inbound inbox (in-memory)
- `/logs` Recent in-memory logs for webhooks and actions
- `/settings` Environment info (names only)
- `/how-it-works` Explainer of flows and security

## API Endpoints
- `POST /api/twilio/outbound-call` — triggers a Twilio call
- `POST /api/twilio/webhook/voice` — inbound voice TwiML (validated)
- `POST /api/twilio/webhook/sms` — inbound SMS webhook (validated)
- `POST /api/twilio/ivr-action` — IVR menu logic (validated)
- `POST /api/twilio/send-sms` — send SMS/MMS
- `GET /api/twilio/video-token?identity=...` — short-lived Video token
- `GET /api/twilio/voice-token?identity=...` — Voice token (for Twilio Client)
- `GET /api/twilio/recording/:sid` — secure proxy to Twilio recording media
- `POST /api/twilio/validate-webhook` — example signature validation helper

UI helpers:
- `GET /api/ui/logs` — returns recent in-memory logs
- `GET /api/ui/inbox` — returns inbound SMS inbox

## IVR Flow (Glocify Support)

- Provision any Twilio voice-capable toll-free or local support number (example: `+1 (888) 555‑0134`) and set its **Voice webhook** (A Call Comes In) to `POST https://<your-domain>/api/twilio/webhook/voice`.
- Callers hear: “Welcome to Glocify customer support. Press 1 to learn about Glocify, press 2 to hear about our services, or press 3 to talk to our representative.”
  - **Press 1**: Plays a short Glocify overview and returns to the main menu.
  - **Press 2**: Plays a services summary (voice, video, messaging) and returns to the main menu.
  - **Press 3**: Uses `<Dial>` to call the number you set in `TWILIO_SUPPORT_AGENT_NUMBER` (falls back to `TWILIO_PHONE_NUMBER`). If the callee doesn’t answer or rejects the call, the caller hears “All representatives are busy right now” and gets redirected back to the menu.
- All IVR endpoints validate Twilio signatures and loop back to `/api/twilio/webhook/voice` whenever there is no input.

## Security Notes
- Never expose Twilio credentials client-side. All secrets are in environment variables server-side.
- Webhooks are validated with `X-Twilio-Signature` against `TWILIO_AUTH_TOKEN`.
- Critical endpoints (SMS send, outbound call) use a token-bucket rate limiter.
- Inputs are validated (phone numbers in E.164, message body length, etc.).
- Use HTTPS via ngrok in development.

## India-specific Guidance (TRAI / DLT)
- For promotional messaging in India, you must register templates and headers with your DLT operator per TRAI regulations. This demo does not circumvent local rules.
- Use E.164 +91 formatting and Twilio-provisioned Indian numbers when possible. Some features may have regional restrictions — consult Twilio documentation/support.

## Example cURL

Send SMS:
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"to":"+91XXXXXXXXXX","body":"Hello from demo"}' \
  "https://<ngrok>/api/twilio/send-sms"
```

Inbound SMS (simulate webhook):
```bash
curl -X POST "https://<ngrok>/api/twilio/webhook/sms" \
  -H "X-Twilio-Signature: <computed>" \
  --data-urlencode "From=+91XXXXXXXXXX" \
  --data-urlencode "To=+91YYYYYYYYYY" \
  --data-urlencode "Body=Test"
```

Outbound call:
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"to":"+91XXXXXXXXXX","record":true}' \
  "https://<ngrok>/api/twilio/outbound-call"
```

Video token:
```bash
curl "https://<ngrok>/api/twilio/video-token?identity=alice"
```

## Smoke Test

With the dev server running:
```bash
# configure: export TEST_PHONE_TO=+91XXXXXXXXXX
npm run smoke
```

## Deploying (Vercel)
- Set all environment variables in Vercel project settings.
- For webhooks, point Twilio Console to your deployed HTTPS URLs.
- Consider adding IP allowlists and further auth for admin endpoints in production.

## Notes
- No database is used; logs and inbox clear with server restarts.
- Some Twilio features may be region-limited in India (e.g., CNAM). Verify capabilities and consult Twilio support.
