export default function SettingsPage() {
  return (
    <div className="card">
      <h2>Settings</h2>
      <p className="muted">This demo reads Twilio credentials from environment variables only.</p>
      <ul>
        <li><code>TWILIO_ACCOUNT_SID</code></li>
        <li><code>TWILIO_AUTH_TOKEN</code></li>
        <li><code>TWILIO_API_KEY_SID</code></li>
        <li><code>TWILIO_API_KEY_SECRET</code></li>
        <li><code>TWILIO_PHONE_NUMBER</code></li>
        <li><code>NEXT_PUBLIC_APP_ORIGIN</code></li>
        <li><code>JWT_SECRET</code> (optional)</li>
      </ul>
      <p className="muted">Never hardcode credentials client-side. Use ngrok for HTTPS during local dev.</p>
    </div>
  );
}


