import React, { useState, useEffect } from 'react';

export default function McpInspector() {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('falkordb_cypher_query');
  const [queryInput, setQueryInput] = useState('MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count');
  const [decisionInput, setDecisionInput] = useState('adr_001');
  const [executionResult, setExecutionResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch('/api/mcp/tools')
      .then(res => res.json())
      .then(data => setTools(data.tools || []))
      .catch(err => console.error('Error fetching MCP tools:', err));
  }, []);

  async function handleExecute() {
    setRunning(true);
    setExecutionResult(null);

    let args = {};
    if (selectedTool === 'falkordb_cypher_query') {
      args = { query: queryInput };
    } else if (selectedTool === 'falkordb_trace_decision_impact') {
      args = { decisionId: decisionInput };
    } else if (selectedTool === 'falkordb_explain_connection') {
      args = { startId: 'adr_001', endId: 'src/utils/token.util.js' };
    } else if (selectedTool === 'falkordb_get_agent_memory') {
      args = { agentId: 'agent_falkorbrain' };
    }

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: selectedTool, arguments: args })
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
      {/* Tool Selector & Arguments */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Model Context Protocol (MCP)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track 01: Exposing FalkorDB graph capabilities as standard agent tools.
          </p>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Select Tool
          </label>
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            style={{
              width: '100%',
              marginTop: '0.35rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.6rem',
              borderRadius: '6px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            {tools.map(t => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Argument Inputs */}
        {selectedTool === 'falkordb_cypher_query' && (
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Cypher Query
            </label>
            <textarea
              rows={4}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: '#a5f3fc',
                padding: '0.6rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        )}

        {selectedTool === 'falkordb_trace_decision_impact' && (
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Decision ID
            </label>
            <input
              type="text"
              value={decisionInput}
              onChange={(e) => setDecisionInput(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.6rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>
        )}

        <button onClick={handleExecute} className="btn-primary" disabled={running} style={{ justifyContent: 'center' }}>
          {running ? 'Executing Tool...' : 'Execute MCP Tool'}
        </button>
      </div>

      {/* Execution Results View */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
          MCP Response Payload
        </h3>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {executionResult ? (
            <pre className="code-block" style={{ height: '100%' }}>
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic', padding: '2rem 0' }}>
              Select a tool on the left and click "Execute MCP Tool" to view live FalkorDB responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
