# Hackathon Submission: FalkorBrain

**Team Name:** Team 7vengers  
**Project Name:** FalkorBrain: Autonomous Engineering Context Engine  
**Repository:** https://github.com/krishsf5/Graph-Hack-Hackathon-Team-7vengers  
**Target Tracks:** Track 01 (Agents That Act on Connected Data), Track 02 (Agent Memory and Coordination), Track 03 (Company Brain)

---

## Elevator Pitch
FalkorBrain transforms AI agents from isolated vector searchers into relationship-aware systems by using FalkorDB as the central Knowledge Graph context layer. By connecting team members, architectural decisions (ADRs), code dependencies, and multi-tier memories (episodic, semantic, procedural), FalkorBrain enables multi-hop reasoning, transparent explainability traces, and MCP tool orchestration.

---

## The Problem It Solves
Standard AI agents lack relational context:
1. They treat code and memories as flat text chunks, missing multi-hop dependencies.
2. They cannot explain the chain of reasoning that led to a decision.
3. They lose organizational context (who authored which decision, why a rule exists, what code modules depend on it).

---

## How It Works With FalkorDB
The graph shapes every step the agent takes:
1. **Multi-Hop Traversal:** The agent resolves questions through parameterized Cypher queries tracing `(User)-[:AUTHORED]->(Decision)-[:AFFECTS]->(SourceFile)-[:IMPORTS]->(DependentFile)`.
2. **Explainability Trace:** Every agent answer cites the exact path traversed in FalkorDB, giving users full transparency into how the answer was derived.
3. **Model Context Protocol (MCP) Integration:** Exposes FalkorDB graph querying, impact tracing, and memory retrieval tools to any MCP-compatible agent or IDE.
4. **Dynamic Codebase Ingestion:** Scans JavaScript/TypeScript code using Babel AST parser and maps files, imports, and symbols as live nodes and edges into FalkorDB.
5. **Persistent Memory Across Sessions:** Stores episodic meeting notes, semantic concepts, and procedural review rules directly as graph nodes.

---

## Tech Stack
- **Graph Database & Context Engine:** FalkorDB (Cypher query language, node/range indexing, graph algorithms)
- **Backend API & Orchestration:** Node.js, Express, @babel/parser, @babel/traverse, falkordb SDK
- **Frontend Dashboard:** React, Vite, Vanilla CSS design system
- **Protocols & Standards:** Model Context Protocol (MCP), REST API
