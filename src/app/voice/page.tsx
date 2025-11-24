'use client';
import { useState } from 'react';

export default function VoicePage() {
  const [to, setTo] = useState('');
  const [record, setRecord] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function placeCall() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/twilio/outbound-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, record }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (e: any) {
      setResult({ ok: false, data: { error: e?.message } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Voice</h2>
      <p className="muted">Enter an E.164 phone number (e.g., +919876543210) and place a call.</p>
      <label>Phone number (E.164)</label>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+91..." />
      <div style={{ margin: '8px 0' }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={record} onChange={(e) => setRecord(e.target.checked)} /> Enable recording
        </label>
      </div>
      <div className="row">
        <button onClick={placeCall} disabled={loading}>Call</button>
      </div>
      {result && (
        <div style={{ marginTop: 12 }}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}


