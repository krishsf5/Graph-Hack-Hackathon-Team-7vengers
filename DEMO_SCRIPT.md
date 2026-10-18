# FalkorBrain Demo Video Script (Team 7vengers)

Length: 2 - 3 Minutes
Focus: WeMakeDevs x FalkorDB Hackathon (Tracks 01, 02, and 03)

---

## 0:00 - 0:30: The Hook & The Problem
- **Voiceover:**
  "Standard AI agents suffer from disconnected memory. Traditional vector search treats memories and code chunks as isolated islands of text. When you ask an agent why an architectural decision was made or how modifying a token utility impacts authentication services, vector similarity guesses without understanding relationships.
  
  Welcome to FalkorBrain, built by Team 7vengers for the FalkorDB Hackathon. We replaced flat vector tables with FalkorDB as the central context layer for autonomous agents."

---

## 0:30 - 1:15: Multi-Hop Reasoning & Explainability (Track 01)
- **Visual:** Open FalkorBrain Dashboard on `http://localhost:5173`. Click the prompt: *"What files and symbols are impacted by ADR-001?"*
- **Voiceover:**
  "Notice what happens behind the scenes. FalkorBrain executes a multi-hop Cypher traversal through FalkorDB:
  
  MATCH (d:Decision {id: 'adr_001'})-[:AFFECTS]->(f:SourceFile)
  OPTIONAL MATCH (f)<-[:IMPORTS]-(importer:SourceFile)
  OPTIONAL MATCH (f)-[:DEFINES]->(sym:CodeSymbol)
  RETURN d, f, importer, sym

  Instead of hallucinations, the agent delivers an answer grounded in graph topology. Look at the Explainability Trace: every step of the graph traversal path is visible and verifiable."

---

## 1:15 - 1:55: Agent Memory & Team Brain (Track 02 & Track 03)
- **Visual:** Switch to the **Graph Visualizer** tab. Show the connected nodes: Users (Krish, Sarah), Sessions, ADRs, Code Files, and Memories.
- **Voiceover:**
  "In Track 02 and Track 03, memory cannot sit on the side. In FalkorBrain:
  - Episodic memory captures meeting sessions and decisions.
  - Semantic memory retains technical best practices.
  - Procedural memory dictates code review requirements.
  
  When an engineer touches `token.util.js`, the graph immediately alerts the agent that Krish authored ADR-001 which governs this file, and Sarah reviewed it. We can even point FalkorBrain at any local codebase, and its AST parser dynamically extracts imports and symbols directly into FalkorDB."

---

## 1:55 - 2:30: Model Context Protocol (MCP) Tools & Conclusion
- **Visual:** Switch to the **MCP Tools Inspector** tab. Select `falkordb_cypher_query` and click **Execute MCP Tool**.
- **Voiceover:**
  "FalkorBrain exposes its entire graph context layer through the Model Context Protocol (MCP). External IDE extensions and agents can seamlessly call tools like `falkordb_trace_decision_impact` and `falkordb_explain_connection`.
  
  FalkorBrain puts FalkorDB at the center of agent decision-making. Thank you for watching!"
