# FalkorBrain (Team 7vengers)
### *Give Your Agents the Context to Act with FalkorDB*

[![FalkorDB Hackathon](https://img.shields.io/badge/FalkorDB-Hackathon%202026-brightgreen)](https://www.wemakedevs.org/hackathons/falkordb)
[![Team](https://img.shields.io/badge/Team-7vengers-blue)](https://github.com/krishsf5/Graph-Hack-Hackathon-Team-7vengers)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success?style=for-the-badge&logo=render)](https://falkorbrain.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 **Live Demo Application:** [https://falkorbrain.onrender.com](https://falkorbrain.onrender.com)

---

## Overview

Standard AI agents suffer from disconnected memory: vector retrieval returns isolated fragments without structural relationships, losing track of why decisions were made, who owns which system, and how code modules interconnect.

**FalkorBrain** replaces brittle tabular vector stores with **FalkorDB as the central Knowledge Graph context engine**. By representing memories, architecture decision records (ADRs), code dependencies, and agent interactions as nodes and multi-hop edges, agents navigate real relationships rather than guessing.

Built for the **WeMakeDevs x FalkorDB Hackathon**, targeting:
- **Track 01 (Agents That Act on Connected Data):** Multi-hop Cypher reasoning, graph traversal tools, explainable decision traces, and MCP server integration.
- **Track 02 (Agent Memory and Coordination):** Cross-session episodic, semantic, and procedural memory persisted and shared across agent swarms.
- **Track 03 (Company / Engineering Brain):** Unified graph linking decisions, code repositories, team knowledge, and documentation.

---

## Architecture: The Graph Context Layer

```
                        +---------------------------+
                        |      User / Client        |
                        +-------------+-------------+
                                      |
                                      v
                        +---------------------------+
                        |      Interactive UI       |
                        | (Graph Visualizer + Trace)|
                        +-------------+-------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                        FalkorBrain Agent Core                           |
|                                                                         |
|  +--------------------+   +---------------------+   +----------------+  |
|  |  Intent Classifier |   | Autonomous Loop     |   | MCP Server     |  |
|  +---------+----------+   +----------+----------+   +-------+--------+  |
|            |                         |                      |           |
|            +-------------------------+----------------------+           |
|                                      |                                  |
|                                      v                                  |
|                         +-------------------------+                     |
|                         |  Graph Tool Orchestrator|                     |
|                         +------------+------------+                     |
+--------------------------------------|----------------------------------+
                                       |
                   Cypher Queries & Vector Traversals
                                       |
                                       v
+-------------------------------------------------------------------------+
|                           FalkorDB Graph Engine                         |
|                                                                         |
|  (:User) --------[:DECIDED]-------> (:Decision / ADR)                   |
|     |                                       |                           |
|  [:ASSIGNED]                            [:AFFECTS]                      |
|     v                                       v                           |
|  (:Agent) ---[:LEARNED_IN]---> (:Session)  (:SourceFile)                |
|                                    |                |                   |
|                               [:PRODUCED]       [:IMPORTS]              |
|                                    v                v                   |
|                               (:Memory) -----> (:SourceFile)            |
+-------------------------------------------------------------------------+
```

---

## Key Capabilities

1. **Multi-Hop Graph Reasoning:** Agents query Cypher paths to discover indirect dependencies (e.g., *“Altering File A breaks ADR B, which was created for Requirement C”*).
2. **Transparent Decision Trace:** Every answer cites the exact Cypher path and subgraph traversed, eliminating AI hallucinations.
3. **Model Context Protocol (MCP) Ready:** Exposes FalkorDB graph inspection and memory tools directly to standard MCP-compatible clients.
4. **Episodic & Procedural Memory:** Graph nodes retain conversation history, learned facts, and architectural rules across sessions.

---

## Quickstart

### 1. Prerequisites
- [Docker](https://www.docker.com/) (or FalkorDB Cloud instance)
- [Node.js](https://nodejs.org/) (v18+)

### 2. Start FalkorDB
```bash
docker run -d -p 6379:6379 --name falkordb falkordb/falkordb:latest
```

### 3. Clone and Run
```bash
git clone https://github.com/krishsf5/Graph-Hack-Hackathon-Team-7vengers.git
cd Graph-Hack-Hackathon-Team-7vengers
npm install
npm run dev
```

---

## Team 7vengers
Developed for the WeMakeDevs FalkorDB Hackathon.
