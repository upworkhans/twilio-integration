const supportNumber = process.env.TWILIO_PHONE_NUMBER || 'your Twilio support number';

export default function IVRPage() {
  return (
    <div className="card">
      <h2>IVR Demo</h2>
      <p>
        Call <strong>{supportNumber}</strong> to try the Glocify IVR hotline. You&rsquo;ll hear our branded greeting and
        can explore the same menu a customer would use when contacting support.
      </p>
      <ul>
        <li>
          <strong>Press 1 – About Glocify</strong>: a short overview of how Glocify unifies voice, video, and messaging
          to power customer engagement.
        </li>
        <li>
          <strong>Press 2 – Our Services</strong>: outlines the solutions (programmable voice, secure video rooms, and
          automated messaging workflows) we offer.
        </li>
        <li>
          <strong>Press 3 – Talk to a representative</strong>: dials the number defined in{' '}
          <code>TWILIO_SUPPORT_AGENT_NUMBER</code> (fallbacks to <code>TWILIO_PHONE_NUMBER</code>). If the person you&rsquo;re
          trying to reach doesn&rsquo;t answer, the IVR politely lets you know and returns to the menu.
        </li>
      </ul>
      <p className="muted">
        Tip: set <code>TWILIO_PHONE_NUMBER</code> (and optional <code>TWILIO_SUPPORT_AGENT_NUMBER</code>) in your
        environment to update the hotline number without changing code.
      </p>
    </div>
  );
}


