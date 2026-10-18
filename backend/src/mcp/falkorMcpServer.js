import { executeCypher, getDecisionImpactTrace, explainConnectionPath, getAgentMemories } from '../graph/queries.js';
import { getGraph } from '../config/falkordb.js';

export const MCP_TOOLS = [
  {
    name: 'falkordb_cypher_query',
    description: 'Execute a read-only Cypher query against the FalkorDB knowledge graph to explore relationships, nodes, and multi-hop paths.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The Cypher query string (e.g., MATCH (d:Decision)-[:AFFECTS]->(f:SourceFile) RETURN d, f)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'falkordb_trace_decision_impact',
    description: 'Multi-hop reasoning tool: Trace how an Architecture Decision Record (ADR) propagates to source files, symbols, and dependent code modules.',
    parameters: {
      type: 'object',
      properties: {
        decisionId: {
          type: 'string',
          description: 'The ID of the decision (e.g., adr_001)'
        }
      },
      required: ['decisionId']
    }
  },
  {
    name: 'falkordb_explain_connection',
    description: 'Explainability tool: Find the shortest relational path between any two entities in the knowledge graph.',
    parameters: {
      type: 'object',
      properties: {
        startId: { type: 'string', description: 'Start node ID or path' },
        endId: { type: 'string', description: 'End node ID or path' }
      },
      required: ['startId', 'endId']
    }
  },
  {
    name: 'falkordb_get_agent_memory',
    description: 'Memory coordination tool: Retrieve episodic, semantic, or procedural memory for an agent from the graph.',
    parameters: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'Agent identifier (e.g., agent_falkorbrain)' },
        memoryType: { type: 'string', enum: ['episodic', 'semantic', 'procedural'], description: 'Type of memory' }
      },
      required: ['agentId']
    }
  }
];

export async function handleMcpToolCall(toolName, args = {}) {
  switch (toolName) {
    case 'falkordb_cypher_query': {
      if (!args.query) throw new Error('Query parameter is required.');
      return await executeCypher(args.query);
    }
    case 'falkordb_trace_decision_impact': {
      if (!args.decisionId) throw new Error('decisionId parameter is required.');
      return await getDecisionImpactTrace(args.decisionId);
    }
    case 'falkordb_explain_connection': {
      if (!args.startId || !args.endId) throw new Error('startId and endId are required.');
      return await explainConnectionPath(args.startId, args.endId);
    }
    case 'falkordb_get_agent_memory': {
      return await getAgentMemories(args.agentId || 'agent_falkorbrain', args.memoryType || null);
    }
    default:
      throw new Error(`Unknown MCP tool: ${toolName}`);
  }
}
