import { Router } from 'express';
import { askAgent } from '../services/agent.service.js';
import { executeCypher, getGraphVisualizationData, getDecisionImpactTrace } from '../graph/queries.js';
import { seedInitialKnowledgeGraph } from '../graph/seeder.js';
import { ingestCodebase } from '../services/codeIngest.service.js';
import { MCP_TOOLS, handleMcpToolCall } from '../mcp/falkorMcpServer.js';

const router = Router();

// Agent Question Answering with Graph Context
router.post('/agent/ask', async (req, res) => {
  try {
    const { question, agentId } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }
    const result = await askAgent({ question, agentId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Direct Cypher Query Execution
router.post('/graph/cypher', async (req, res) => {
  try {
    const { query, params } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Cypher query is required.' });
    }
    const result = await executeCypher(query, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Graph Visualization Data for Frontend Canvas
router.get('/graph/visualize', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const data = await getGraphVisualizationData(limit);
    res.json({ elements: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decision Impact Multi-Hop Trace
router.get('/graph/trace/:decisionId', async (req, res) => {
  try {
    const data = await getDecisionImpactTrace(req.params.decisionId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reseed Graph
router.post('/graph/seed', async (req, res) => {
  try {
    await seedInitialKnowledgeGraph();
    res.json({ message: 'FalkorDB graph reseeded successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ingest Local Codebase into Knowledge Graph
router.post('/graph/ingest', async (req, res) => {
  try {
    const { directoryPath } = req.body;
    if (!directoryPath) {
      return res.status(400).json({ error: 'directoryPath is required.' });
    }
    const result = await ingestCodebase(directoryPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Model Context Protocol (MCP) Endpoints
router.get('/mcp/tools', (req, res) => {
  res.json({ tools: MCP_TOOLS });
});

router.post('/mcp/call', async (req, res) => {
  try {
    const { tool, arguments: args } = req.body;
    const result = await handleMcpToolCall(tool, args);
    res.json({ tool, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
