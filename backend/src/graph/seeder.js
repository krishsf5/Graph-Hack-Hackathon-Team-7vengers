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

  console.log('[Seeder] Creating connected nodes and relationships for Tracks 01, 02, and 03...');

  const seedCypher = `
    // ==========================================
    // 1. Team & Ownership (Track 03: Company Brain)
    // ==========================================
    CREATE (u1:User {id: 'user_krish', name: 'Krish', role: 'Lead Architect', email: 'krish@company.internal', tenantId: 'tenant_alpha'})
    CREATE (u2:User {id: 'user_sarah', name: 'Sarah', role: 'Senior Security Engineer', email: 'sarah@company.internal', tenantId: 'tenant_alpha'})

    // ==========================================
    // 2. Multi-Agent Swarm (Track 02: Agent Memory & Coordination)
    // ==========================================
    CREATE (a1:Agent {id: 'agent_architect', name: 'Architect Agent', role: 'Architecture & Impact Analyzer'})
    CREATE (a2:Agent {id: 'agent_security', name: 'Security Auditor Agent', role: 'Policy & Compliance Verifier'})

    // Agent Handoff & Shared State
    CREATE (a1)-[:HANDED_OFF_TO {task: 'Verify token renewal lists', status: 'COMPLETED', handoffTime: '2026-09-15T11:00:00Z'}]->(a2)

    // ==========================================
    // 3. Concepts & Expertise (Track 03: Who knows what)
    // ==========================================
    CREATE (c_auth:Concept {name: 'Authentication', description: 'User identity, session management, and tokens'})
    CREATE (c_sec:Concept {name: 'Security', description: 'Zero-trust, encryption, and safe storage'})
    CREATE (c_graph:Concept {name: 'GraphRAG', description: 'Graph-augmented context retrieval for LLM agents'})

    CREATE (u1)-[:EXPERT_IN]->(c_graph)
    CREATE (u1)-[:EXPERT_IN]->(c_auth)
    CREATE (u2)-[:EXPERT_IN]->(c_sec)

    // ==========================================
    // 4. Tickets & Documentation (Track 03: Company Brain)
    // ==========================================
    CREATE (t1:Ticket {
      id: 'SEC-402',
      title: 'Stale role string vulnerability in client sessions',
      status: 'RESOLVED',
      priority: 'HIGH',
      reporter: 'Sarah'
    })

    CREATE (doc1:Document {
      id: 'DOC-88',
      title: 'Zero-Trust Identity Specification',
      url: 'https://docs.company.internal/security/zero-trust'
    })

    // ==========================================
    // 5. Architecture Decision Records (ADRs) (Track 01 & 03)
    // ==========================================
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

    // Decision Sources & Lineage
    CREATE (d1)-[:RESOLVES_TICKET]->(t1)
    CREATE (d1)-[:CITES_DOCUMENT]->(doc1)
    CREATE (u1)-[:AUTHORED]->(d1)
    CREATE (u1)-[:AUTHORED]->(d2)
    CREATE (u2)-[:REVIEWED]->(d1)

    // ==========================================
    // 6. Source Files, Symbols, & Ownership (Track 01 & 03: Who owns what)
    // ==========================================
    CREATE (f_auth:SourceFile {path: 'src/services/auth.service.js', language: 'JavaScript', summary: 'Handles user login, credential verification, and token issuance'})
    CREATE (f_token:SourceFile {path: 'src/utils/token.util.js', language: 'JavaScript', summary: 'Signs and verifies RS256 JWT tokens'})
    CREATE (f_repo:SourceFile {path: 'src/repositories/user.repository.js', language: 'JavaScript', summary: 'Database queries for user records and dynamic roles'})

    CREATE (s_verify:CodeSymbol {name: 'verifyToken', kind: 'function', file: 'src/utils/token.util.js', startLine: 15, endLine: 40})
    CREATE (s_login:CodeSymbol {name: 'loginUser', kind: 'function', file: 'src/services/auth.service.js', startLine: 22, endLine: 65})

    // Code Dependencies & Containment
    CREATE (f_auth)-[:IMPORTS]->(f_token)
    CREATE (f_auth)-[:IMPORTS]->(f_repo)
    CREATE (f_token)-[:DEFINES]->(s_verify)
    CREATE (f_auth)-[:DEFINES]->(s_login)

    // Code Ownership
    CREATE (u1)-[:OWNS]->(f_auth)
    CREATE (u1)-[:OWNS]->(f_token)
    CREATE (u2)-[:OWNS]->(f_repo)

    // Decision -> Code Impact
    CREATE (d1)-[:AFFECTS]->(f_auth)
    CREATE (d1)-[:AFFECTS]->(f_token)
    CREATE (t1)-[:REPORTS_ISSUE_IN]->(f_token)

    // ==========================================
    // 7. Sessions & Multi-Tier Memory (Track 02: Episodic, Semantic, Procedural)
    // ==========================================
    CREATE (sess1:Session {id: 'sess_101', title: 'Security Review of JWT Claims', timestamp: '2026-09-14T10:00:00Z', tenantId: 'tenant_alpha'})
    CREATE (sess2:Session {id: 'sess_102', title: 'FalkorDB Hackathon Kickoff', timestamp: '2026-10-18T09:30:00Z', tenantId: 'tenant_alpha'})

    CREATE (m1:Memory {
      id: 'mem_001',
      title: 'JWT Payload Immutable Principle',
      content: 'Never store plain role strings like "Admin" inside client-held tokens. Always resolve permissions from userCode.',
      category: 'Security Best Practice',
      memoryType: 'semantic',
      importance: 9,
      tenantId: 'tenant_alpha'
    })

    CREATE (m2:Memory {
      id: 'mem_002',
      title: 'Session #101 Key Takeaway',
      content: 'Krish and Sarah agreed that token renewal must check revocation lists every 15 minutes.',
      category: 'Meeting Minutes',
      memoryType: 'episodic',
      importance: 7,
      tenantId: 'tenant_alpha'
    })

    CREATE (m3:Memory {
      id: 'mem_003',
      title: 'Code Review Guideline: Token Changes',
      content: 'Whenever token.util.js is touched, run full regression tests and verify ADR-001 compliance.',
      category: 'Engineering Procedure',
      memoryType: 'procedural',
      importance: 8,
      tenantId: 'tenant_alpha'
    })

    // Connect Memory to Agents, Users, and Decisions
    CREATE (u1)-[:PARTICIPATED_IN]->(sess1)
    CREATE (u2)-[:PARTICIPATED_IN]->(sess1)
    CREATE (sess1)-[:PRODUCED]->(m1)
    CREATE (sess1)-[:PRODUCED]->(m2)
    CREATE (sess1)-[:PRODUCED]->(d1)

    CREATE (a1)-[:RECORDED]->(m1)
    CREATE (a1)-[:RECORDED]->(m2)
    CREATE (a2)-[:RECORDED]->(m3)

    CREATE (m1)-[:REFERENCES]->(d1)
    CREATE (m1)-[:RELATES_TO]->(c_sec)
    CREATE (m1)-[:RELATES_TO]->(c_auth)
    CREATE (m3)-[:REFERENCES]->(d1)
    CREATE (m3)-[:AFFECTS]->(f_token)
  `;

  await graph.query(seedCypher);
  console.log('[Seeder] Graph successfully populated for Tracks 01, 02, and 03!');
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
