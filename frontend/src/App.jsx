import React, { useState } from 'react';
import AgentChat from './components/AgentChat';
import GraphVisualizer from './components/GraphVisualizer';
import McpInspector from './components/McpInspector';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div>
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <span className="brand-badge">FalkorDB</span>
          <div>
            <h1 className="brand-title">FalkorBrain</h1>
            <p className="brand-subtitle">Team 7vengers | Autonomous Graph Context Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Agent Chat & Explainability
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            Graph Visualizer
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp')}
          >
            MCP Tools Inspector
          </button>
        </nav>
      </header>

      {/* Main Body */}
      <main className="app-body">
        {activeTab === 'chat' && <AgentChat />}
        {activeTab === 'visualizer' && <GraphVisualizer />}
        {activeTab === 'mcp' && <McpInspector />}
      </main>
    </div>
  );
}
