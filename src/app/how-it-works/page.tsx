export default function ExplainerPage() {
  return (
    <div className="card">
      <h2>How this works</h2>
      <ul>
        <li><strong>Webhook validation</strong>: All Twilio webhooks are validated with the signature header.</li>
        <li><strong>Rate limiting</strong>: Token-bucket per IP for SMS and calling endpoints.</li>
        <li><strong>No DB</strong>: Logs and inbox are in-memory LRU queues only.</li>
        <li><strong>Tokens</strong>: Server signs short-lived JWTs for Video/Voice access.</li>
        <li><strong>India notes</strong>: Use E.164 +91 format, configure DLT templates per TRAI rules.</li>
      </ul>
      <p className="muted">Endpoints under <code>/api/twilio/*</code> implement the server logic using Twilio SDK.</p>
    </div>
  );
}


