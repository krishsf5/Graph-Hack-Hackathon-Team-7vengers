import axios from 'axios';
import {
  executeCypher,
  getDecisionImpactTrace,
  explainConnectionPath,
  getAgentHandoffs,
  getCompanyOwnershipAndExperts,
  getDecisionLineage
} from '../graph/queries.js';
import { buildGraphContext } from './falkorContext.service.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const LLM_MODEL = process.env.LLM_MODEL || 'qwen2.5-coder:7b';

/**
 * Intelligent heuristic synthesizer that translates FalkorDB graph structures
 * into clear, formatted, human-readable answers without raw markdown headers.
 */
async function synthesizeGraphAnswer(question, contextData) {
  const { decisionImpact, memories, searchResults } = contextData;
  const qLower = question.toLowerCase();

  // Scenario 0 (Track 03): Decision Lineage & Source Provenance
  if (qLower.includes('source') || qLower.includes('lineage') || qLower.includes('ticket') || qLower.includes('origin')) {
    const lineage = await getDecisionLineage('adr_001');
    if (lineage) {
      let ans = `### Decision Lineage & Source Provenance (Track 03)\n\n`;
      ans += `**${lineage.title}**\n\n`;
      ans += `> ${lineage.decision}\n\n`;
      ans += `#### Root Cause & Provenance:\n`;
      if (lineage.ticketId) {
        ans += `- **Originating Ticket:** \`${lineage.ticketId}\` - *${lineage.ticketTitle}* (Status: \`${lineage.ticketStatus}\`)\n`;
      }
      if (lineage.docTitle) {
        ans += `- **Governing Specification:** [${lineage.docTitle}](${lineage.docUrl})\n`;
      }
      ans += `- **Author:** **${lineage.author}** | **Reviewer:** **${lineage.reviewer}**\n\n`;
      ans += `*Traceability established through FalkorDB relationships (Decision -> Ticket & Document).*`;
      return ans;
    }
  }

  // Scenario 1: Question about ADR impact (e.g. files and symbols)
  if (decisionImpact && decisionImpact.length > 0) {
    const primary = decisionImpact[0];
    let ans = `### Architectural Decision Impact Analysis\n\n`;
    ans += `**${primary.decisionTitle}**\n\n`;
    ans += `> ${primary.decisionText}\n\n`;
    ans += `#### Directly Impacted Files & Defined Symbols:\n`;

    decisionImpact.forEach((item) => {
      const symbols = item.definedSymbols && item.definedSymbols.length > 0
        ? ` (Defines: \`${item.definedSymbols.join('`, `')}\`)`
        : '';
      ans += `- **File:** \`${item.affectedFile}\`${symbols}\n`;

      if (item.dependentFiles && item.dependentFiles.length > 0) {
        ans += `  - **Multi-Hop Dependent Importers:** \`${item.dependentFiles.join('`, `')}\`\n`;
      }
    });

    ans += `\n*Context derived directly from FalkorDB graph traversal (Decision -> SourceFile -> Importers).*`;
    return ans;
  }

  // Scenario 2: Question about Session agreements / meeting takeaways
  if (qLower.includes('session') || qLower.includes('agree') || qLower.includes('takeaway')) {
    const episodic = memories.filter(m => m.memoryType === 'episodic');
    if (episodic.length > 0) {
      let ans = `### Session Agreement & Decisions\n\n`;
      episodic.forEach(m => {
        ans += `**${m.title}** (Importance: ${m.importance}/10)\n`;
        ans += `${m.content}\n\n`;
      });
      return ans.trim();
    }
  }

  // Scenario 3: Question about JWT / Token rules
  if (qLower.includes('jwt') || qLower.includes('token') || qLower.includes('usercode') || qLower.includes('role')) {
    const relevantMemories = memories.filter(m =>
      m.title.toLowerCase().includes('jwt') ||
      m.title.toLowerCase().includes('token') ||
      m.content.toLowerCase().includes('role') ||
      m.content.toLowerCase().includes('usercode')
    );

    if (relevantMemories.length > 0) {
      let ans = `### FalkorDB Security & Architectural Guidance\n\n`;
      relevantMemories.forEach(m => {
        ans += `**${m.title}** [${m.memoryType.toUpperCase()}]\n`;
        ans += `${m.content}\n\n`;
        if (m.referencedDecisions && m.referencedDecisions.length > 0) {
          ans += `*Governing Decision:* ${m.referencedDecisions.join(', ')}\n\n`;
        }
      });
      return ans.trim();
    }
  }

  // Scenario 4 (Track 02): Multi-Agent Handoffs & Coordination
  if (qLower.includes('handoff') || qLower.includes('coordination') || qLower.includes('shared state')) {
    const handoffs = await getAgentHandoffs();
    if (handoffs && handoffs.length > 0) {
      let ans = `### Multi-Agent Coordination & Shared State (Track 02)\n\n`;
      handoffs.forEach(h => {
        ans += `- **Handoff:** \`${h.fromAgent}\` -> \`${h.toAgent}\`\n`;
        ans += `  - **Task:** ${h.task}\n`;
        ans += `  - **Status:** \`${h.status}\` | **Timestamp:** \`${h.handoffTime}\`\n\n`;
      });
      ans += `*Persistent agent coordination state stored directly in FalkorDB.*`;
      return ans;
    }
  }

  // Scenario 5 (Track 03): Company Brain - Ownership & Domain Experts
  if (qLower.includes('owns') || qLower.includes('ownership') || qLower.includes('expert')) {
    const company = await getCompanyOwnershipAndExperts();
    let ans = `### Company Brain: Ownership & Knowledge Matrix (Track 03)\n\n`;
    if (company.fileOwnership && company.fileOwnership.length > 0) {
      ans += `#### Code & Service Owners:\n`;
      company.fileOwnership.forEach(o => {
        ans += `- **File:** \`${o.file}\` -> **Owner:** **${o.owner}** (${o.role})\n`;
      });
      ans += `\n`;
    }
    if (company.domainExperts && company.domainExperts.length > 0) {
      ans += `#### Subject Matter Experts (Who Knows What):\n`;
      company.domainExperts.forEach(e => {
        ans += `- **Domain:** \`${e.concept}\` -> **Expert:** **${e.expert}**\n`;
      });
    }
    return ans;
  }

  // Scenario 6 (Track 03): Decision Lineage & Source Provenance
  if (qLower.includes('source') || qLower.includes('lineage') || qLower.includes('ticket') || qLower.includes('origin')) {
    const lineage = await getDecisionLineage('adr_001');
    if (lineage) {
      let ans = `### Decision Lineage & Source Provenance (Track 03)\n\n`;
      ans += `**${lineage.title}**\n\n`;
      ans += `> ${lineage.decision}\n\n`;
      ans += `#### Root Cause & Provenance:\n`;
      if (lineage.ticketId) {
        ans += `- **Originating Ticket:** \`${lineage.ticketId}\` - *${lineage.ticketTitle}* (Status: \`${lineage.ticketStatus}\`)\n`;
      }
      if (lineage.docTitle) {
        ans += `- **Governing Specification:** [${lineage.docTitle}](${lineage.docUrl})\n`;
      }
      ans += `- **Author:** **${lineage.author}** | **Reviewer:** **${lineage.reviewer}**\n`;
      return ans;
    }
  }

  // Default: Synthesize from connected search results
  if (searchResults && searchResults.length > 0) {
    let ans = `### Knowledge Graph Insights\n\n`;
    const seen = new Set();
    searchResults.slice(0, 8).forEach(r => {
      if (r.relation && r.neighborName) {
        const text = `**(${r.nodeType}: ${r.nodeName})** connected via **-[:${r.relation}]->** to **(${r.neighborType}: ${r.neighborName})**`;
        if (!seen.has(text)) {
          seen.add(text);
          ans += `- ${text}\n`;
        }
      }
    });
    return ans;
  }

  return `Based on FalkorDB analysis, no direct relationship path exists for this query in the current graph.`;
}

/**
 * Executes a question answering cycle with FalkorDB Graph Context & Multi-Hop Reasoning.
 */
export async function askAgent({ question, agentId = 'agent_falkorbrain' }) {
  console.log(`[Agent] Processing question: "${question}"`);

  // 1. Fetch structured graph context from FalkorDB
  const contextData = await buildGraphContext(question, agentId);

  // 2. Synthesize system prompt for LLM
  const systemPrompt = `
You are FalkorBrain, an autonomous engineering context agent powered by FalkorDB.
Your primary directive is to use the relationships and facts in the FalkorDB Knowledge Graph to reason, explain decisions, and answer questions.
Always cite the specific entities and relationships from the graph in your answer.
Never hallucinate relationships that do not exist in the graph.

FalkorDB Context:
${contextData.contextText}
`.trim();

  let answerText = '';
  let usedModel = LLM_MODEL;

  // 3. Attempt local LLM call via Ollama; fallback to structured graph synthesizer
  try {
    const res = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: LLM_MODEL,
      system: systemPrompt,
      prompt: question,
      stream: false,
    }, { timeout: 3000 });

    answerText = res.data.response;
  } catch (err) {
    usedModel = 'FalkorBrain Knowledge Graph Engine';
    answerText = await synthesizeGraphAnswer(question, contextData);
  }

  // 4. Trace explainability paths for entities mentioned in question
  let explainabilityTrace = [];
  try {
    const qLower = question.toLowerCase();
    if (qLower.includes('adr-001') || qLower.includes('adr_001') || qLower.includes('token') || qLower.includes('jwt')) {
      const trace = await explainConnectionPath('adr_001', 'src/utils/token.util.js');
      explainabilityTrace = trace;
    } else if (qLower.includes('krish') && qLower.includes('token')) {
      const trace = await explainConnectionPath('user_krish', 'src/utils/token.util.js');
      explainabilityTrace = trace;
    }
  } catch (err) {
    console.warn('[Agent] Trace path resolution skipped:', err.message);
  }

  return {
    question,
    answer: answerText,
    graphContext: contextData.contextText,
    explainabilityTrace,
    model: usedModel,
    timestamp: new Date().toISOString()
  };
}
