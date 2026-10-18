import React, { useState, useEffect } from 'react';

const NODE_COLORS = {
  User: '#3b82f6',
  Decision: '#f59e0b',
  SourceFile: '#10b981',
  Memory: '#8b5cf6',
  CodeSymbol: '#06b6d4',
  Concept: '#ec4899',
  Session: '#64748b'
};

export default function GraphVisualizer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterLabel, setFilterLabel] = useState('ALL');

  useEffect(() => {
    fetchGraph();
  }, []);

  async function fetchGraph() {
    setLoading(true);
    try {
      const res = await fetch('/api/graph/visualize');
      const json = await res.json();
      setData(json.elements || []);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique nodes
  const nodeMap = new Map();
  data.forEach((edge) => {
    if (edge.source && edge.source.id) {
      nodeMap.set(edge.source.id, edge.source);
    }
    if (edge.target && edge.target.id) {
      nodeMap.set(edge.target.id, edge.target);
    }
  });
  const nodes = Array.from(nodeMap.values());

  const filteredEdges = filterLabel === 'ALL'
    ? data
    : data.filter(e => e.source?.label === filterLabel || e.target?.label === filterLabel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
      {/* Top Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Node Label:</span>
          {['ALL', 'Decision', 'SourceFile', 'Memory', 'User', 'Concept'].map(lbl => (
            <button
              key={lbl}
              onClick={() => setFilterLabel(lbl)}
              style={{
                background: filterLabel === lbl ? 'var(--bg-tertiary)' : 'transparent',
                color: filterLabel === lbl ? 'var(--accent-falkor)' : 'var(--text-muted)',
                border: filterLabel === lbl ? '1px solid var(--border-highlight)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        <button onClick={fetchGraph} className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
          Refresh Graph
        </button>
      </div>

      {/* Main View Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Graph Nodes Grid & Relationship Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Knowledge Graph Nodes ({nodes.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {nodes.map((node) => {
                const color = NODE_COLORS[node.label] || '#94a3b8';
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.1)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? color : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '0.6rem 0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      minWidth: '140px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color, fontWeight: 700 }}>
                      {node.label}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      {node.title || node.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Connected Relationships ({filteredEdges.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredEdges.map((edge, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--bg-secondary)',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ color: NODE_COLORS[edge.source?.label] || '#fff', fontWeight: 600 }}>
                    ({edge.source?.label}: {edge.source?.title || edge.source?.id})
                  </span>
                  <span style={{ color: 'var(--accent-falkor)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.15rem 0.4rem', background: 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>
                    {`-[:${edge.relation}]->`}
                  </span>
                  <span style={{ color: NODE_COLORS[edge.target?.label] || '#fff', fontWeight: 600 }}>
                    ({edge.target?.label}: {edge.target?.title || edge.target?.id})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Entity Inspector
          </h3>
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Label</span>
                <div style={{ color: NODE_COLORS[selectedNode.label] || '#fff', fontWeight: 700 }}>
                  {selectedNode.label}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identifier</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                  {selectedNode.id}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title / Name</span>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                  {selectedNode.title}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any node from the canvas to inspect its properties and relationships.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
