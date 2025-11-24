'use client';
import { useEffect, useState } from 'react';

type InboxItem = { from: string; to: string; body: string; mediaUrls: string[]; ts: number };

export default function SmsPage() {
  const [to, setTo] = useState('');
  const [body, setBody] = useState('Hello from Next.js demo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function validateInputs() {
    if (!to.trim()) return 'Destination number is required.';
    if (!/^\+\d{8,15}$/.test(to.trim())) return 'Number must be E.164 format, e.g., +919876543210';
    if (!body.trim()) return 'Message body cannot be empty.';
    if (mediaUrl && !/^https?:\/\//i.test(mediaUrl.trim())) return 'Media URL must start with http(s)://';
    return null;
  }

  async function send() {
    const validationError = validateInputs();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setIsSending(true);
    setResult({ ok: null, status: 'pending', statusText: 'Sending...', data: { message: 'Sending request…' } });
    try {
      const res = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim(), body: body.trim(), mediaUrl: mediaUrl || undefined }),
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e: any) {
          data = { error: 'Failed to parse JSON response', details: e?.message || String(e) };
        }
      } else {
        const text = await res.text();
        data = { error: 'Non-JSON response', details: text || 'Empty response' };
      }
      
      setResult({ 
        ok: res.ok, 
        status: res.status,
        statusText: res.statusText,
        data 
      });
    } catch (e: any) {
      setResult({ 
        ok: false, 
        status: 0,
        statusText: 'Network Error',
        data: { 
          error: e?.message || 'Failed to send request',
          details: e?.stack || String(e),
          type: e?.name || 'Error'
        } 
      });
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    const id = setInterval(async () => {
      // Fetch inbox from logs endpoint
      const res = await fetch('/api/ui/inbox');
      if (res.ok) {
        const data = await res.json();
        setInbox(data.items || []);
      }
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card">
      <h2>SMS / MMS</h2>
      <label>To (E.164)</label>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+91..." />
      <label>Message body</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
      <label>Media URL (optional)</label>
      <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
      {formError && <p className="error-text">{formError}</p>}
      <div className="row">
        <button onClick={send} disabled={isSending}>{isSending ? 'Sending…' : 'Send SMS/MMS'}</button>
      </div>
      {result && (
        <div className="result-container">
          <div className={`result-header ${result.ok ? 'result-success' : 'result-error'}`}>
            <strong>{result.ok ? '✓ Success' : '✗ Error'}</strong>
            {result.status && <span className="result-status">Status: {result.status} {result.statusText}</span>}
          </div>
          <pre className="result-content">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <h3>Inbound Inbox (in-memory)</h3>
      <div>
        {inbox.length === 0 && <p className="muted">No messages yet.</p>}
        {inbox.map((m) => (
          <div key={m.ts} className="card">
            <div><strong>{m.from}</strong> → {m.to}</div>
            <div>{m.body}</div>
            {m.mediaUrls?.length > 0 && (
              <ul>
                {m.mediaUrls.map((u) => (
                  <li key={u}><a href={u} target="_blank" rel="noreferrer">Media</a></li>
                ))}
              </ul>
            )}
            <div className="muted">{new Date(m.ts).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


