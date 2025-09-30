import { BaseAgent, AgentConfig } from "./base-agent";
import { loadClientContextFromSupermemory, SupermemoryService } from "../services/supermemory";
import { RAGService, searchInsuranceKnowledge, searchStateInfo } from "../services/rag";

const ASSISTANT_SYSTEM_PROMPT = `You are an expert insurance advisor AI with comprehensive knowledge of:
- Commercial and personal lines insurance
- State-specific regulations and requirements (all 50 states)
- ISO forms, endorsements, and carrier-specific language
- Risk management and coverage analysis

Context availability:
- Client documents (CAG): Preloaded in Supermemory for instant access with persistent memory
- Industry knowledge (RAG): Retrieved on-demand from vector store
- Real-time data: Web search for current regulations/rates

Guidelines:
- ALWAYS cite sources for document-based claims using [cite:doc_name:page] format
- Use RAG for industry knowledge not in client context
- Clearly indicate uncertainty with phrases like "Based on available documents..." or "This may require verification..."
- Suggest human review for complex legal interpretations
- Explain technical insurance concepts in accessible language
- Provide actionable recommendations, not just information
- When asked about specific documents, reference the exact document name and location

Response Format:
- Start with a direct answer
- Provide supporting details with citations
- End with recommendations or next steps (if applicable)

Example Citation: "Your general liability policy [cite:GL-2025-001:p.12] includes a $2M aggregate limit..."`;

export class InsuranceAssistantAgent extends BaseAgent {
  private clientId?: string;

  constructor(clientId?: string) {
    const config: AgentConfig = {
      name: "insurance-assistant",
      description: "Conversational AI assistant with insurance expertise (CAG + RAG)",
      model: "claude-opus-4-5-20250929", // Use Opus for highest quality user-facing chat
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: ASSISTANT_SYSTEM_PROMPT,
    };

    super(config);
    this.clientId = clientId;
    this.registerTools();
  }

  private registerTools() {
    // CAG Tool: Load client context from Supermemory
    this.registerTool({
      name: "load_client_context",
      description: "Load all documents and data for the current client from Supermemory (CAG)",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Optional: Specific query to search within client context",
          },
        },
      },
      handler: async (params) => {
        if (!this.clientId) {
          return {
            error: "No client selected. Please select a client first.",
          };
        }

        const context = await loadClientContextFromSupermemory(
          this.clientId,
          params.query
        );

        return {
          success: true,
          clientContext: context,
          message: "Client context loaded from Supermemory (CAG)",
        };
      },
    });

    // CAG Tool: Semantic search within client memories using Supermemory
    this.registerTool({
      name: "search_client_documents",
      description: "Search within client documents and memories using semantic search (Supermemory)",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
          limit: {
            type: "number",
            description: "Number of results to return (default: 5)",
          },
        },
        required: ["query"],
      },
      handler: async (params) => {
        if (!this.clientId) {
          return {
            error: "No client selected",
          };
        }

        const results = await SupermemoryService.searchClientMemories({
          clientId: this.clientId,
          query: params.query,
          limit: params.limit || 5,
        });

        return {
          success: true,
          results: results.map((r) => ({
            id: r.id,
            content: r.content.substring(0, 500), // First 500 chars
            score: r.score,
            metadata: r.metadata,
          })),
        };
      },
    });

    // RAG Tool: Search industry knowledge base
    this.registerTool({
      name: "search_industry_knowledge",
      description: "Search insurance industry knowledge base (ISO forms, regulations, best practices)",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Knowledge query",
          },
          category: {
            type: "string",
            enum: ["forms", "regulations", "case-law", "carrier-specs"],
            description: "Optional: Category to search",
          },
        },
        required: ["query"],
      },
      handler: async (params) => {
        const results = await searchInsuranceKnowledge(params.query, params.category);

        return {
          success: true,
          results: results.map((text, idx) => ({
            id: `knowledge-${idx}`,
            text,
            source: "Industry Knowledge Base",
          })),
        };
      },
    });

    // RAG Tool: Search state regulations
    this.registerTool({
      name: "search_state_regulations",
      description: "Search state-specific insurance regulations",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Regulation query",
          },
          state: {
            type: "string",
            description: "Two-letter state code (e.g., CA, NY, TX)",
          },
        },
        required: ["query", "state"],
      },
      handler: async (params) => {
        const results = await searchStateInfo(params.query, params.state);

        return {
          success: true,
          results: results.map((text, idx) => ({
            id: `regulation-${params.state}-${idx}`,
            text,
            state: params.state,
            source: `${params.state} State Regulations`,
          })),
        };
      },
    });

    // Tool: Explain insurance term
    this.registerTool({
      name: "explain_insurance_term",
      description: "Provide a clear explanation of an insurance term or concept",
      input_schema: {
        type: "object",
        properties: {
          term: {
            type: "string",
            description: "The insurance term to explain",
          },
        },
        required: ["term"],
      },
      handler: async (params) => {
        // In production, this would use RAG to search knowledge base
        // For now, provide basic definitions

        const definitions: Record<string, string> = {
          "general aggregate": "The total amount an insurer will pay for all claims during the policy period, regardless of the number of claims.",
          "occurrence": "An accident, including continuous or repeated exposure to substantially the same general harmful conditions, that results in bodily injury or property damage.",
          "deductible": "The amount the insured must pay out-of-pocket before the insurance coverage applies.",
          "endorsement": "A written modification to an insurance policy that changes the terms, coverage, or conditions of the original policy.",
          "additional insured": "A person or organization not automatically covered by the policy, but added to the policy for coverage by endorsement.",
          "waiver of subrogation": "A contractual provision whereby an insured waives the right of their insurance carrier to seek redress from a negligent third party.",
        };

        const term = params.term.toLowerCase();
        const definition = definitions[term];

        if (definition) {
          return {
            success: true,
            term: params.term,
            definition,
            source: "Insurance Glossary",
          };
        }

        // If not found, search knowledge base
        const results = await searchInsuranceKnowledge(`Define ${params.term}`);

        return {
          success: true,
          term: params.term,
          definition: results[0] || "Term not found. Please consult with an insurance professional.",
          source: "Industry Knowledge Base",
        };
      },
    });

    // Tool: Analyze coverage gaps
    this.registerTool({
      name: "analyze_coverage_gaps",
      description: "Analyze potential coverage gaps in client's insurance program",
      input_schema: {
        type: "object",
        properties: {
          clientContext: {
            type: "string",
            description: "Client context from load_client_context",
          },
        },
      },
      handler: async (params) => {
        // In production, this would use sophisticated analysis
        // For now, return structured guidance

        return {
          success: true,
          analysis: {
            commonGaps: [
              {
                gap: "Cyber Liability",
                severity: "high",
                recommendation: "Consider standalone cyber liability policy given technology operations",
              },
              {
                gap: "Professional Liability (E&O)",
                severity: "medium",
                recommendation: "Evaluate need based on professional services provided",
              },
              {
                gap: "Employment Practices Liability (EPLI)",
                severity: "medium",
                recommendation: "Recommended for companies with 5+ employees",
              },
            ],
            nextSteps: [
              "Review current operations and exposures",
              "Request quotes for identified gaps",
              "Discuss with insurance advisor",
            ],
          },
        };
      },
    });

    // Tool: Trigger workflow
    this.registerTool({
      name: "trigger_workflow",
      description: "Trigger an automated workflow (e.g., proposal generation, policy comparison)",
      input_schema: {
        type: "object",
        properties: {
          workflowType: {
            type: "string",
            enum: ["proposal_generation", "policy_comparison", "coverage_check"],
          },
          parameters: {
            type: "object",
            description: "Workflow-specific parameters",
          },
        },
        required: ["workflowType"],
      },
      handler: async (params) => {
        // In production, this would invoke actual workflows

        return {
          success: true,
          workflowType: params.workflowType,
          status: "queued",
          message: `${params.workflowType} workflow has been queued. You'll receive a notification when complete.`,
        };
      },
    });
  }

  async chat(params: {
    message: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    loadClientContext?: boolean;
  }) {
    const messages: any[] = params.conversationHistory || [];

    // Optionally load client context automatically
    if (params.loadClientContext && this.clientId) {
      messages.unshift({
        role: "user",
        content: "Load the client context first using load_client_context tool.",
      });
    }

    messages.push({
      role: "user",
      content: params.message,
    });

    const result = await this.run(messages, {
      maxSteps: 20,
      onStep: (step) => {
        console.log(`Assistant step ${step.step}:`, step.stopReason);
      },
    });

    return result;
  }
}

// Export convenience function
export async function chatWithAssistant(params: {
  message: string;
  clientId?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const agent = new InsuranceAssistantAgent(params.clientId);

  const result = await agent.chat({
    message: params.message,
    conversationHistory: params.conversationHistory,
    loadClientContext: !!params.clientId,
  });

  return {
    success: true,
    response: result.content,
    steps: result.steps,
  };
}