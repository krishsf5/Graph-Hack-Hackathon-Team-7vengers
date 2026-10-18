import React, { useState } from 'react';

function formatInline(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function FormattedContent({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return <div key={idx} className="agent-h3">{trimmed.replace('### ', '')}</div>;
        }
        if (trimmed.startsWith('#### ')) {
          return <div key={idx} className="agent-h4">{trimmed.replace('#### ', '')}</div>;
        }
        if (trimmed.startsWith('> ')) {
          return <blockquote key={idx} className="agent-quote">{formatInline(trimmed.replace('> ', ''))}</blockquote>;
        }
        if (trimmed.startsWith('- ')) {
          const isIndented = line.startsWith('  ');
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginLeft: isIndented ? '1.25rem' : '0.25rem' }}>
              <span style={{ color: 'var(--accent-falkor)', fontSize: '0.85rem', lineHeight: 1.6 }}>•</span>
              <span className="agent-bullet">{formatInline(trimmed.replace('- ', ''))}</span>
            </div>
          );
        }
        if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
          return <div key={idx} className="agent-note">{trimmed.slice(1, -1)}</div>;
        }

        return <div key={idx} style={{ lineHeight: 1.6, fontSize: '0.92rem' }}>{formatInline(line)}</div>;
      })}
    </div>
  );
}

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
    { track: 'Track 01: Connected Data', q: 'What files and symbols are impacted by ADR-001?' },
    { track: 'Track 01: Reasoning Path', q: 'Explain the connection between Krish and token.util.js' },
    { track: 'Track 02: Coordination', q: 'Show shared handoffs and state between Architect Agent and Security Agent' },
    { track: 'Track 02: Episodic Memory', q: 'What did Krish and Sarah agree upon in Session #101?' },
    { track: 'Track 03: Company Brain', q: 'Who owns auth.service.js and who is expert in Security?' },
    { track: 'Track 03: Provenance', q: 'Trace the source origin and ticket for ADR-001' }
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
        text: data.answer || (data.error ? `Error: ${data.error}` : 'No response generated.'),
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
              {msg.role === 'user' ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>{msg.text}</div>
              ) : (
                <FormattedContent text={msg.text} />
              )}

              {/* Explainability Trace Display */}
              {msg.explainTrace && msg.explainTrace.length > 0 && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Graph Traversal Path (Explainability):
                  </div>
                  {msg.explainTrace.map((traceItem, tIdx) => (
                    <div key={tIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.25)' }}>
                      {traceItem.pathNodes && traceItem.pathNodes.map((nodeName, nIdx) => (
                        <React.Fragment key={nIdx}>
                          <span style={{ background: '#1e293b', color: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
                            {nodeName}
                          </span>
                          {traceItem.relationships && traceItem.relationships[nIdx] && (
                            <span style={{ color: 'var(--accent-falkor)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                              {`-[:${traceItem.relationships[nIdx]}]->`}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
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
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.q)}
                style={{
                  textAlign: 'left',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-falkor)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.track}
                </span>
                <span>"{item.q}"</span>
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
