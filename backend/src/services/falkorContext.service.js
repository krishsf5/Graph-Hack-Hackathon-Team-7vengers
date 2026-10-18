import { searchConnectedContext, getAgentMemories, getDecisionImpactTrace } from '../graph/queries.js';

/**
 * Builds structured graph context for the LLM prompt based on query keywords and agent memory.
 */
export async function buildGraphContext(query, agentId = 'agent_falkorbrain') {
  const [searchResults, memories] = await Promise.all([
    searchConnectedContext(query),
    getAgentMemories(agentId)
  ]);

  let contextText = '### FALKORDB KNOWLEDGE GRAPH CONTEXT\n\n';

  // 1. Agent Persistent Memories (Track 02)
  if (memories && memories.length > 0) {
    contextText += '#### PERSISTENT AGENT MEMORY (Episodic & Procedural):\n';
    for (const mem of memories.slice(0, 5)) {
      contextText += `- [${mem.memoryType.toUpperCase()} | Importance: ${mem.importance}] ${mem.title}: ${mem.content}\n`;
      if (mem.referencedDecisions && mem.referencedDecisions.length > 0) {
        contextText += `  Connected Decisions: ${mem.referencedDecisions.join(', ')}\n`;
      }
    }
    contextText += '\n';
  }

  // 2. Connected Entity Relationships (Track 01 & Track 03)
  if (searchResults && searchResults.length > 0) {
    contextText += '#### CONNECTED GRAPH RELATIONSHIPS (Multi-Hop Context):\n';
    const seenEdges = new Set();

    for (const row of searchResults) {
      if (row.relation && row.neighborName) {
        const edgeKey = `${row.nodeName}->${row.relation}->${row.neighborName}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          contextText += `- (${row.nodeType}: "${row.nodeName}") -[:${row.relation}]-> (${row.neighborType}: "${row.neighborName}")\n`;
        }
      } else {
        contextText += `- [${row.nodeType}] "${row.nodeName}": ${row.nodeDetails}\n`;
      }
    }
    contextText += '\n';
  } else {
    contextText += 'No direct graph entities found for this specific query.\n\n';
  }

  return contextText;
}
