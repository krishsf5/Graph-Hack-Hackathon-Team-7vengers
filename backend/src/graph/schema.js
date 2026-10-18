import { getGraph } from '../config/falkordb.js';

/**
 * Initializes Graph Indices in FalkorDB for rapid property lookups.
 * FalkorDB supports range and single-property indexes on node labels.
 */
export async function initGraphSchema() {
  const graph = await getGraph();
  console.log('[Schema] Ensuring FalkorDB indices...');

  const indexQueries = [
    'CREATE INDEX FOR (u:User) ON (u.id)',
    'CREATE INDEX FOR (a:Agent) ON (a.id)',
    'CREATE INDEX FOR (m:Memory) ON (m.id)',
    'CREATE INDEX FOR (d:Decision) ON (d.id)',
    'CREATE INDEX FOR (f:SourceFile) ON (f.path)',
    'CREATE INDEX FOR (s:CodeSymbol) ON (s.name)',
    'CREATE INDEX FOR (c:Concept) ON (c.name)',
    'CREATE INDEX FOR (sess:Session) ON (sess.id)'
  ];

  for (const query of indexQueries) {
    try {
      await graph.query(query);
    } catch (err) {
      // Index may already exist; FalkorDB throws harmless message if already present
      if (!err.message.includes('already exists')) {
        console.warn(`[Schema] Index notice: ${err.message}`);
      }
    }
  }

  console.log('[Schema] Graph indices initialized.');
}
