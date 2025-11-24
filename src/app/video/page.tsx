'use client';
import { useEffect, useMemo, useState } from 'react';
import VideoRoom from '@/components/VideoChat/VideoRoom';

const randomSlug = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
const windowExists = () => typeof window !== 'undefined';

export default function VideoPage() {
  const [identity, setIdentity] = useState(() => randomSlug('user'));
  const [roomName, setRoomName] = useState(() => randomSlug('room'));
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (!windowExists()) return;
    const urlRoom = new URLSearchParams(window.location.search).get('room');
    if (urlRoom) {
      setRoomName(urlRoom);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomName);
      window.history.replaceState({}, '', url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!windowExists()) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomName);
    window.history.replaceState({}, '', url);
  }, [roomName]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const shareUrl = useMemo(() => {
    if (!windowExists()) return '';
    const origin = window.location.origin;
    return `${origin}/video?room=${encodeURIComponent(roomName)}`;
  }, [roomName]);

  async function fetchToken() {
    setError(null);
    setToken(null);
    const cleanIdentity = identity.trim();
    const cleanRoom = roomName.trim();
    if (!cleanIdentity) {
      setError('Display name is required');
      return;
    }
    if (!cleanRoom) {
      setError('Room name is required');
      return;
    }

    const uniqueIdentity = `${cleanIdentity}-${randomSlug('p')}`;

    const res = await fetch(
      `/api/twilio/video-token?identity=${encodeURIComponent(uniqueIdentity)}&room=${encodeURIComponent(cleanRoom)}`
    );
    const data = await res.json();
    if (!res.ok) setError(data?.error || 'Failed');
    else setToken(data.token);
  }

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => setCopied(true));
  }

  function refreshRoom() {
    const newRoom = randomSlug('room');
    setRoomName(newRoom);
  }

  return (
    <div className="card">
      <h2>Programmable Video</h2>
      <p className="muted">
        Create a unique room link, share it, and join with a distinct display name to avoid duplicate identity disconnects.
      </p>

      <label>Display name</label>
      <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Your name" />

      <label>Room name</label>
      <div className="row" style={{ gap: '8px' }}>
        <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="room-awesome" />
        <button type="button" onClick={refreshRoom}>
          New Room
        </button>
      </div>

      <label>Shareable Room Link</label>
      <div className="row" style={{ gap: '8px' }}>
        <input value={shareUrl} readOnly placeholder="Generate a room to see link" />
        <button type="button" onClick={handleCopyLink} disabled={!shareUrl}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={fetchToken} disabled={!identity.trim() || !roomName.trim()}>
          Join Video Room
        </button>
        {token && (
          <button onClick={() => setToken(null)} style={{ background: '#aaa' }}>
            Leave
          </button>
        )}
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {participants.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Participants</h3>
          <ul>
            {participants.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      {token && (
        <div style={{ height: '600px', marginTop: 16 }}>
          <VideoRoom
            token={token}
            roomName={roomName}
            onLeave={() => setToken(null)}
            onParticipantsChange={setParticipants}
          />
        </div>
      )}
    </div>
  );
}
