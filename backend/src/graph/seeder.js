import { getGraph } from '../config/falkordb.js';
import { initGraphSchema } from './schema.js';

export async function seedInitialKnowledgeGraph() {
  console.log('[Seeder] Initializing FalkorDB graph schema and sample data...');
  const graph = await getGraph();
  await initGraphSchema();

  // Clear existing nodes for a clean seed
  console.log('[Seeder] Cleaning previous demo graph...');
  try {
    await graph.query('MATCH (n) DETACH DELETE n');
  } catch (err) {
    console.warn('[Seeder] Warning during clean:', err.message);
  }

  console.log('[Seeder] Creating connected nodes and relationships...');

  const seedCypher = `
    // 1. Users & Team
    CREATE (u1:User {id: 'user_krish', name: 'Krish', role: 'Lead Architect', email: 'krish@example.com'})
    CREATE (u2:User {id: 'user_sarah', name: 'Sarah', role: 'Senior Security Engineer', email: 'sarah@example.com'})

    // 2. Agents
    CREATE (a1:Agent {id: 'agent_falkorbrain', name: 'FalkorBrain Core', role: 'Context & Code Intelligence Agent'})

    // 3. Concepts
    CREATE (c_auth:Concept {name: 'Authentication', description: 'User identity, session management, and tokens'})
    CREATE (c_sec:Concept {name: 'Security', description: 'Zero-trust, encryption, and safe storage'})
    CREATE (c_graph:Concept {name: 'GraphRAG', description: 'Graph-augmented context retrieval for LLM agents'})

    // 4. Architecture Decision Records (ADRs)
    CREATE (d1:Decision {
      id: 'adr_001',
      title: 'ADR-001: Use IDs in JWT Payload instead of Roles Strings',
      decision: 'JWT claims must only store immutable numerical userCode and departmentId. Role names must be resolved dynamically at authorization time.',
      rationale: 'Role names change dynamically across departments; baking strings into tokens causes stale authorization bugs.',
      status: 'APPROVED',
      date: '2026-09-15'
    })

    CREATE (d2:Decision {
      id: 'adr_002',
      title: 'ADR-002: Adopt FalkorDB for Multi-Hop Agent Context',
      decision: 'Migrate from isolated pgvector flat retrieval to FalkorDB Knowledge Graph.',
      rationale: 'Agents require multi-hop relationship reasoning and explainable decision paths across code, memories, and decisions.',
      status: 'APPROVED',
      date: '2026-10-18'
    })

    // 5. Source Files & Symbols
    CREATE (f_auth:SourceFile {path: 'src/services/auth.service.js', language: 'JavaScript', summary: 'Handles user login, credential verification, and token issuance'})
    CREATE (f_token:SourceFile {path: 'src/utils/token.util.js', language: 'JavaScript', summary: 'Signs and verifies RS256 JWT tokens'})
    CREATE (f_repo:SourceFile {path: 'src/repositories/user.repository.js', language: 'JavaScript', summary: 'Database queries for user records and dynamic roles'})

    CREATE (s_verify:CodeSymbol {name: 'verifyToken', kind: 'function', file: 'src/utils/token.util.js', startLine: 15, endLine: 40})
    CREATE (s_login:CodeSymbol {name: 'loginUser', kind: 'function', file: 'src/services/auth.service.js', startLine: 22, endLine: 65})

    // 6. Sessions & Memories (Episodic, Semantic, Procedural)
    CREATE (sess1:Session {id: 'sess_101', title: 'Security Review of JWT Claims', timestamp: '2026-09-14T10:00:00Z'})
    CREATE (sess2:Session {id: 'sess_102', title: 'FalkorDB Hackathon Kickoff', timestamp: '2026-10-18T09:30:00Z'})

    CREATE (m1:Memory {
      id: 'mem_001',
      title: 'JWT Payload Immutable Principle',
      content: 'Never store plain role strings like "Admin" inside client-held tokens. Always resolve permissions from userCode.',
      category: 'Security Best Practice',
      memoryType: 'semantic',
      importance: 9
    })

    CREATE (m2:Memory {
      id: 'mem_002',
      title: 'Session #101 Key Takeaway',
      content: 'Krish and Sarah agreed that token renewal must check revocation lists every 15 minutes.',
      category: 'Meeting Minutes',
      memoryType: 'episodic',
      importance: 7
    })

    CREATE (m3:Memory {
      id: 'mem_003',
      title: 'Code Review Guideline: Token Changes',
      content: 'Whenever token.util.js is touched, run full regression tests and verify ADR-001 compliance.',
      category: 'Engineering Procedure',
      memoryType: 'procedural',
      importance: 8
    })

    // 7. Relationships (The Graph Context!)
    CREATE (u1)-[:AUTHORED]->(d1)
    CREATE (u1)-[:AUTHORED]->(d2)
    CREATE (u2)-[:REVIEWED]->(d1)
    CREATE (u1)-[:PARTICIPATED_IN]->(sess1)
    CREATE (u2)-[:PARTICIPATED_IN]->(sess1)

    CREATE (sess1)-[:PRODUCED]->(m1)
    CREATE (sess1)-[:PRODUCED]->(m2)
    CREATE (sess1)-[:PRODUCED]->(d1)

    CREATE (a1)-[:RECORDED]->(m1)
    CREATE (a1)-[:RECORDED]->(m2)
    CREATE (a1)-[:RECORDED]->(m3)

    CREATE (d1)-[:AFFECTS]->(f_auth)
    CREATE (d1)-[:AFFECTS]->(f_token)
    CREATE (d2)-[:RELATES_TO]->(c_graph)

    CREATE (f_auth)-[:IMPORTS]->(f_token)
    CREATE (f_auth)-[:IMPORTS]->(f_repo)
    CREATE (f_token)-[:DEFINES]->(s_verify)
    CREATE (f_auth)-[:DEFINES]->(s_login)

    CREATE (m1)-[:REFERENCES]->(d1)
    CREATE (m1)-[:RELATES_TO]->(c_sec)
    CREATE (m1)-[:RELATES_TO]->(c_auth)
    CREATE (m3)-[:REFERENCES]->(d1)
    CREATE (m3)-[:AFFECTS]->(f_token)
  `;

  await graph.query(seedCypher);
  console.log('[Seeder] Graph successfully populated with connected entities!');
}

// Allow running directly via "npm run seed"
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  seedInitialKnowledgeGraph()
    .then(() => {
      console.log('[Seeder] Seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder] Error seeding graph:', err);
      process.exit(1);
    });
}
