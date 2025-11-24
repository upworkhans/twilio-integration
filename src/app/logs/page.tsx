'use client';
import { useEffect, useState } from 'react';

export default function LogsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch('/api/ui/logs');
      if (res.ok) setItems((await res.json()).items || []);
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="card">
      <h2>Recent Logs (in-memory)</h2>
      {items.length === 0 && <p className="muted">No logs yet.</p>}
      {items.map((i, idx) => (
        <div key={idx} className="card">
          <div><strong>{i.type}</strong>: {i.event}</div>
          <div className="muted">{new Date(i.ts).toLocaleString()}</div>
          {i.data && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(i.data, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}


