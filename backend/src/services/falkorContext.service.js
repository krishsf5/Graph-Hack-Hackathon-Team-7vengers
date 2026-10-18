import { searchConnectedContext, getAgentMemories, getDecisionImpactTrace, explainConnectionPath } from '../graph/queries.js';

/**
 * Extracts searchable identifiers, entities, and keywords from a user prompt.
 */
function extractSearchTerms(query) {
  const terms = new Set();
  const lowerQuery = query.toLowerCase();

  // Match ADR references (e.g. ADR-001, adr_001)
  const adrMatch = query.match(/adr[-_ ]?0*(\d+)/i);
  if (adrMatch) {
    terms.add(`adr_00${adrMatch[1]}`);
    terms.add(`ADR-00${adrMatch[1]}`);
  }

  // Match Session references (e.g. Session #101, Session 101)
  const sessMatch = query.match(/session[ #_-]*(\d+)/i);
  if (sessMatch) {
    terms.add(`sess_${sessMatch[1]}`);
    terms.add(`Session #${sessMatch[1]}`);
  }

  // Common entity keywords in the graph
  const knownKeywords = ['jwt', 'token', 'krish', 'sarah', 'usercode', 'auth', 'security', 'graphrag', 'revocation'];
  for (const kw of knownKeywords) {
    if (lowerQuery.includes(kw)) {
      terms.add(kw);
    }
  }

  return Array.from(terms);
}

/**
 * Builds structured graph context for the LLM prompt and heuristic reasoning engine.
 */
export async function buildGraphContext(query, agentId = 'agent_falkorbrain') {
  const searchTerms = extractSearchTerms(query);
  const memoriesPromise = getAgentMemories(agentId);

  // If ADR is mentioned, trace its multi-hop impact directly
  let decisionImpact = [];
  const adrMatch = query.match(/adr[-_ ]?0*(\d+)/i);
  if (adrMatch) {
    const adrId = `adr_00${adrMatch[1]}`;
    decisionImpact = await getDecisionImpactTrace(adrId);
  }

  // Search graph for each extracted term
  let searchResults = [];
  if (searchTerms.length > 0) {
    const searchPromises = searchTerms.map(term => searchConnectedContext(term));
    const nestedResults = await Promise.all(searchPromises);
    searchResults = nestedResults.flat();
  } else {
    searchResults = await searchConnectedContext(query);
  }

  const memories = await memoriesPromise;

  let contextText = '';

  // 1. Agent Persistent Memories (Track 02)
  if (memories && memories.length > 0) {
    contextText += 'PERSISTENT AGENT MEMORY (Episodic & Procedural):\n';
    for (const mem of memories.slice(0, 5)) {
      contextText += `- [${mem.memoryType.toUpperCase()} | Importance: ${mem.importance}] ${mem.title}: ${mem.content}\n`;
      if (mem.referencedDecisions && mem.referencedDecisions.length > 0) {
        contextText += `  Connected Decisions: ${mem.referencedDecisions.join(', ')}\n`;
      }
    }
    contextText += '\n';
  }

  // 2. Decision Multi-Hop Impact (Track 01 & 03)
  if (decisionImpact && decisionImpact.length > 0) {
    contextText += 'MULTI-HOP DECISION IMPACT TRACE:\n';
    for (const item of decisionImpact) {
      contextText += `- Decision: "${item.decisionTitle}"\n`;
      contextText += `  Text: ${item.decisionText}\n`;
      contextText += `  Affected File: ${item.affectedFile}\n`;
      if (item.definedSymbols && item.definedSymbols.length > 0) {
        contextText += `  Defined Symbols in File: ${item.definedSymbols.join(', ')}\n`;
      }
      if (item.dependentFiles && item.dependentFiles.length > 0) {
        contextText += `  Dependent Importer Files: ${item.dependentFiles.join(', ')}\n`;
      }
    }
    contextText += '\n';
  }

  // 3. Connected Entity Relationships
  if (searchResults && searchResults.length > 0) {
    contextText += 'CONNECTED GRAPH RELATIONSHIPS:\n';
    const seenEdges = new Set();

    for (const row of searchResults) {
      if (row.relation && row.neighborName) {
        const edgeKey = `${row.nodeName}->${row.relation}->${row.neighborName}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          contextText += `- (${row.nodeType}: "${row.nodeName}") -[:${row.relation}]-> (${row.neighborType}: "${row.neighborName}")\n`;
        }
      } else if (row.nodeName) {
        contextText += `- [${row.nodeType}] "${row.nodeName}": ${row.nodeDetails}\n`;
      }
    }
    contextText += '\n';
  }

  return {
    contextText,
    searchTerms,
    decisionImpact,
    memories,
    searchResults
  };
}
