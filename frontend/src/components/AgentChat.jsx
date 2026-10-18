import React, { useState } from 'react';

export default function AgentChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'agent',
      text: 'Greetings. I am FalkorBrain, your context agent connected directly to FalkorDB. Ask me about architecture decisions, code impact, or memories, and I will reason through the knowledge graph.',
      explainTrace: null,
      contextSnippet: null
    }
  ]);

  const sampleQueries = [
    'What files and symbols are impacted by ADR-001?',
    'Why must JWT tokens store userCode instead of role strings?',
    'What did Krish and Sarah agree upon in Session #101?',
    'Explain the connection between Krish and token.util.js'
  ];

  async function handleSend(promptText = question) {
    const textToSend = promptText.trim();
    if (!textToSend || loading) return;

    const userMsg = { role: 'user', text: textToSend };
    setConversation(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });
      const data = await res.json();

      const agentMsg = {
        role: 'agent',
        text: data.answer || 'No response generated.',
        explainTrace: data.explainabilityTrace,
        graphContext: data.graphContext,
        model: data.model
      };
      setConversation(prev => [...prev, agentMsg]);
    } catch (err) {
      setConversation(prev => [
        ...prev,
        { role: 'agent', text: `Connection error: ${err.message}. Ensure backend is running.` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
      {/* Chat Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>FalkorDB Context Agent</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-hop graph retrieval and verified relational reasoning</p>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-falkor)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-highlight)' }}>
            Track 01 & 02 Enabled
          </span>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {conversation.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #10b981, #0d9488)' : 'var(--bg-secondary)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {msg.role === 'user' ? 'You' : 'FalkorBrain Agent'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>{msg.text}</div>

              {/* Explainability Trace Display */}
              {msg.explainTrace && msg.explainTrace.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Graph Traversal Path (Explainability):
                  </div>
                  <pre className="code-block" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                    {JSON.stringify(msg.explainTrace, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--accent-falkor)', fontSize: '0.85rem' }}>
              Traversing FalkorDB Knowledge Graph...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about architecture decisions, code impact, or team memories..."
              style={{
                flex: 1,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar: Sample Multi-Hop Prompts & Seed Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            Multi-Hop Test Queries
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Click any prompt to trigger multi-hop Cypher traversal in FalkorDB:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  textAlign: 'left',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.4
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-falkor)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Database Controls
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Re-seed the FalkorDB graph with the hackathon demonstration dataset.
          </p>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/graph/seed', { method: 'POST' });
                const d = await res.json();
                alert(d.message || 'Seeded successfully!');
              } catch (err) {
                alert('Seed error: ' + err.message);
              }
            }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Reset / Seed Graph
          </button>
        </div>
      </div>
    </div>
  );
}
