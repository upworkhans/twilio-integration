'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type ChatMessage = {
  id: string;
  username: string;
  message: string;
  ts: number;
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="card"><p>Loading chat…</p></div>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams?.get('id') ?? null;

  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<{ id: string; user1: string; user2: string } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
      const interval = setInterval(() => {
        loadConversation(conversationId);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  async function createConversation() {
    if (!user1.trim() || !user2.trim()) {
      alert('Please enter both usernames');
      return;
    }

    try {
      const res = await fetch('/api/ui/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: user1.trim(), user2: user2.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversation({ id: data.conversationId, user1: data.user1, user2: data.user2 });
        const url = `${window.location.origin}/chat?id=${data.conversationId}`;
        setShareUrl(url);
        router.push(`/chat?id=${data.conversationId}`);
      } else {
        alert(data.error || 'Failed to create conversation');
      }
    } catch (e: any) {
      alert(e?.message || 'Error creating conversation');
    }
  }

  async function loadConversation(id: string) {
    try {
      setError(null);
      const res = await fetch(`/api/ui/chat/conversation?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation({ id: data.id, user1: data.user1, user2: data.user2 });
        setMessages(data.messages || []);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load conversation');
      }
    } catch (e: any) {
      console.error('Failed to load conversation', e);
      setError(e?.message || 'Network error');
    }
  }

  async function sendMessage() {
    if (!conversation || !currentUsername.trim() || !message.trim()) {
      alert('Please enter your username and message');
      return;
    }

    if (currentUsername !== conversation.user1 && currentUsername !== conversation.user2) {
      alert('Username must match one of the conversation participants');
      return;
    }

    try {
      const res = await fetch('/api/ui/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          username: currentUsername.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('');
        loadConversation(conversation.id);
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (e: any) {
      alert(e?.message || 'Error sending message');
    }
  }

  function copyShareUrl() {
    if (shareUrl || conversation) {
      const url = shareUrl || `${window.location.origin}/chat?id=${conversation?.id}`;
      navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    }
  }

  if (!conversation && !conversationId) {
    return (
      <div className="chat-container">
        <div className="chat-card">
          <h2>Create Live Chat</h2>
          <p className="muted">Enter two usernames to start a conversation</p>
          <label>User 1</label>
          <input
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            placeholder="Enter username 1"
            onKeyDown={(e) => e.key === 'Enter' && createConversation()}
          />
          <label>User 2</label>
          <input
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            placeholder="Enter username 2"
            onKeyDown={(e) => e.key === 'Enter' && createConversation()}
          />
          <button onClick={createConversation} className="primary-button">
            Create Conversation
          </button>
        </div>
      </div>
    );
  }

  if (conversationId && !conversation) {
    return (
      <div className="chat-container">
        <div className="chat-card">
          {error ? (
            <div className="error-state">
              <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>
              <div className="row" style={{ gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => loadConversation(conversationId)} className="primary-button">
                  Retry
                </button>
                <button onClick={() => router.push('/chat')} className="secondary-button">
                  Create New Chat
                </button>
              </div>
            </div>
          ) : (
            <p>Loading conversation...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Live Chat</h2>
        <div className="chat-participants">
          <span className="participant-badge">{conversation?.user1}</span>
          <span className="participant-separator">↔</span>
          <span className="participant-badge">{conversation?.user2}</span>
        </div>
        <button onClick={copyShareUrl} className="share-button">
          📋 Copy Share URL
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p className="muted">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.username === currentUsername ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-header">
                <strong>{msg.username}</strong>
                <span className="message-time">{new Date(msg.ts).toLocaleTimeString()}</span>
              </div>
              <div className="message-body">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="username-input-wrapper">
          <label>Your Username</label>
          <input
            value={currentUsername}
            onChange={(e) => setCurrentUsername(e.target.value)}
            placeholder={conversation ? `Enter ${conversation.user1} or ${conversation.user2}` : 'Enter username'}
            className="username-input"
          />
        </div>
        <div className="message-input-wrapper">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button" disabled={!message.trim() || !currentUsername.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

