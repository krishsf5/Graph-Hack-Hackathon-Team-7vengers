import { getGraph } from '../config/falkordb.js';

/**
 * Executes a raw parameterized Cypher query against FalkorDB.
 */
export async function executeCypher(cypher, params = {}) {
  const graph = await getGraph();
  const startTime = Date.now();
  const res = await graph.query(cypher, { params });
  const durationMs = Date.now() - startTime;
  return {
    data: res.data || [],
    header: res.header || [],
    durationMs,
    metadata: res.metadata || []
  };
}

/**
 * Multi-Hop Context Retrieval:
 * Finds all nodes and edges connected to a target node up to N hops.
 */
export async function getMultiHopContext(nodeId, hops = 2) {
  const graph = await getGraph();
  const cypher = `
    MATCH path = (start {id: $nodeId})-[r*1..${hops}]-(neighbor)
    RETURN path
    LIMIT 50
  `;
  const result = await graph.query(cypher, { params: { nodeId } });
  return result.data;
}

/**
 * Traces the impact of an Architecture Decision (ADR) on files and symbols.
 * Multi-hop: (Decision) -> (File) -> (Dependent Files & Symbols)
 */
export async function getDecisionImpactTrace(decisionId) {
  const graph = await getGraph();
  const cypher = `
    MATCH (d:Decision {id: $decisionId})-[:AFFECTS]->(f:SourceFile)
    OPTIONAL MATCH (f)<-[:IMPORTS]-(importer:SourceFile)
    OPTIONAL MATCH (f)-[:DEFINES]->(sym:CodeSymbol)
    RETURN d.title AS decisionTitle,
           d.decision AS decisionText,
           f.path AS affectedFile,
           collect(DISTINCT importer.path) AS dependentFiles,
           collect(DISTINCT sym.name) AS definedSymbols
  `;
  const result = await graph.query(cypher, { params: { decisionId } });
  return result.data;
}

/**
 * Shortest Path Explainability:
 * Discovers the exact relational path connecting two entities in the graph.
 */
export async function explainConnectionPath(startId, endId) {
  const graph = await getGraph();
  const cypher = `
    MATCH p = shortestPath((a {id: $startId})-[*..5]-(b {id: $endId}))
    RETURN [n in nodes(p) | {id: coalesce(n.id, n.path, n.name), label: labels(n)[0], title: coalesce(n.title, n.name, n.path)}] AS nodes,
           [r in relationships(p) | type(r)] AS relationships
  `;
  const result = await graph.query(cypher, { params: { startId, endId } });
  return result.data;
}

/**
 * Retrieve Episodic, Semantic, and Procedural Memories for an Agent.
 */
export async function getAgentMemories(agentId, memoryType = null) {
  const graph = await getGraph();
  let cypher = `
    MATCH (a:Agent {id: $agentId})-[:RECORDED|LEARNED]->(m:Memory)
  `;
  if (memoryType) {
    cypher += ` WHERE m.memoryType = $memoryType `;
  }
  cypher += `
    OPTIONAL MATCH (m)-[:RELATES_TO]->(c:Concept)
    OPTIONAL MATCH (m)-[:REFERENCES]->(d:Decision)
    RETURN m.id AS id,
           m.title AS title,
           m.content AS content,
           m.memoryType AS memoryType,
           m.importance AS importance,
           collect(DISTINCT c.name) AS concepts,
           collect(DISTINCT d.title) AS referencedDecisions
    ORDER BY m.importance DESC
    LIMIT 25
  `;
  const result = await graph.query(cypher, { params: { agentId, memoryType } });
  return result.data;
}

/**
 * Full Graph Context for General Questions:
 * Searches across Memories, Decisions, and Files matching keywords,
 * expanding 1 hop to return connected context.
 */
export async function searchConnectedContext(keyword) {
  const graph = await getGraph();
  const cypher = `
    MATCH (n)
    WHERE (n.title CONTAINS $keyword OR n.content CONTAINS $keyword OR n.decision CONTAINS $keyword OR n.path CONTAINS $keyword)
    OPTIONAL MATCH (n)-[r]-(neighbor)
    RETURN labels(n)[0] AS nodeType,
           coalesce(n.title, n.path, n.name) AS nodeName,
           coalesce(n.content, n.decision, '') AS nodeDetails,
           type(r) AS relation,
           labels(neighbor)[0] AS neighborType,
           coalesce(neighbor.title, neighbor.path, neighbor.name) AS neighborName
    LIMIT 30
  `;
  const result = await graph.query(cypher, { params: { keyword } });
  return result.data;
}

/**
 * Graph Snapshot for Frontend Visualizer (Nodes & Edges).
 */
export async function getGraphVisualizationData(limit = 100) {
  const graph = await getGraph();
  const cypher = `
    MATCH (a)-[r]->(b)
    RETURN {
      id: coalesce(a.id, a.path, a.name),
      label: labels(a)[0],
      title: coalesce(a.title, a.name, a.path)
    } AS source,
    type(r) AS relation,
    {
      id: coalesce(b.id, b.path, b.name),
      label: labels(b)[0],
      title: coalesce(b.title, b.name, b.path)
    } AS target
    LIMIT ${limit}
  `;
  const result = await graph.query(cypher);
  return result.data;
}
