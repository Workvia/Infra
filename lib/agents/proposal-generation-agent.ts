import { BaseAgent, AgentConfig } from "./base-agent";
import { Id } from "@/convex/_generated/dataModel";

const PROPOSAL_SYSTEM_PROMPT = `You are an expert insurance proposal specialist who aggregates multiple carrier quotes into compelling, client-ready proposals.

Your workflow:
1. Load all selected carrier quotes from the database
2. Normalize fields across carriers (premiums, limits, deductibles, conditions)
3. Resolve conflicts using precedence rules
4. Generate executive summary highlighting value and key differences
5. Create detailed comparison tables
6. Apply client branding and render document

Guidelines:
- Use client-friendly language (avoid jargon when possible)
- Highlight material differences between carriers
- Show total cost of ownership (premium + deductibles + fees)
- Flag low-confidence fields for review
- Provide actionable recommendations based on coverage and cost
- Ensure all numbers are accurate and clearly presented
- Include proper disclosures and limitations

Output Format:
- Executive Summary (1-2 paragraphs)
- Carrier Comparison Table
- Coverage Highlights
- Cost Analysis
- Recommendations
- Next Steps`;

export interface QuoteData {
  documentId: Id<"documents">;
  carrier: string;
  policyType: string;
  premium: number;
  effectiveDate: string;
  expirationDate: string;
  limits: Record<string, string | number>;
  deductibles: Record<string, string | number>;
  forms: string[];
  endorsements: string[];
  additionalCoverages?: string[];
}

export class ProposalGenerationAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: "proposal-generator",
      description: "Creates client-ready insurance proposals from multiple carrier quotes",
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      temperature: 0.5,
      systemPrompt: PROPOSAL_SYSTEM_PROMPT,
    };

    super(config);
    this.registerTools();
  }

  private registerTools() {
    // Tool: Load quotes from database
    this.registerTool({
      name: "load_client_quotes",
      description: "Load all selected quotes for the client from the database",
      input_schema: {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            description: "The client ID",
          },
          quoteIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of document IDs for the quotes to include",
          },
        },
        required: ["clientId", "quoteIds"],
      },
      handler: async (params) => {
        // In production, this would query Convex for the documents
        // and load extracted data

        // Mock data for demonstration
        const quotes: QuoteData[] = params.quoteIds.map((id: string, idx: number) => ({
          documentId: id as Id<"documents">,
          carrier: ["Acme Insurance", "Best Insurance Co", "Crown Insurance"][idx] || "Carrier",
          policyType: "General Liability",
          premium: 5000 + (idx * 500),
          effectiveDate: "01/01/2025",
          expirationDate: "01/01/2026",
          limits: {
            "General Aggregate": "$2,000,000",
            "Products/Completed Operations": "$2,000,000",
            "Personal & Advertising Injury": "$1,000,000",
            "Each Occurrence": "$1,000,000",
          },
          deductibles: {
            "Per Claim": idx === 0 ? "$2,500" : idx === 1 ? "$5,000" : "$1,000",
          },
          forms: ["CG 00 01", "CG 00 02"],
          endorsements: ["Additional Insured", "Waiver of Subrogation"],
          additionalCoverages: idx === 2 ? ["Cyber Liability"] : undefined,
        }));

        return {
          success: true,
          quotes,
          clientId: params.clientId,
        };
      },
    });

    // Tool: Normalize carrier data
    this.registerTool({
      name: "normalize_quote_data",
      description: "Normalize fields across different carrier formats for comparison",
      input_schema: {
        type: "object",
        properties: {
          quotes: {
            type: "array",
            description: "Array of quote objects to normalize",
          },
        },
        required: ["quotes"],
      },
      handler: async (params) => {
        // In production, this would handle various carrier formats
        // and normalize to standard schema

        const normalized = params.quotes.map((quote: any) => {
          // Parse premium if it's a string
          const premium = typeof quote.premium === "string"
            ? parseFloat(quote.premium.replace(/[$,]/g, ""))
            : quote.premium;

          // Normalize limits to numbers for comparison
          const normalizedLimits: Record<string, number> = {};
          for (const [key, value] of Object.entries(quote.limits || {})) {
            if (typeof value === "string") {
              normalizedLimits[key] = parseFloat(value.replace(/[$,]/g, ""));
            } else {
              normalizedLimits[key] = value as number;
            }
          }

          return {
            ...quote,
            premium,
            normalizedLimits,
          };
        });

        return {
          success: true,
          normalizedQuotes: normalized,
          comparisonMetrics: {
            lowestPremium: Math.min(...normalized.map((q: any) => q.premium)),
            highestPremium: Math.max(...normalized.map((q: any) => q.premium)),
            averagePremium: normalized.reduce((sum: number, q: any) => sum + q.premium, 0) / normalized.length,
          },
        };
      },
    });

    // Tool: Generate executive summary
    this.registerTool({
      name: "generate_executive_summary",
      description: "Generate an executive summary highlighting key insights and recommendations",
      input_schema: {
        type: "object",
        properties: {
          normalizedQuotes: {
            type: "array",
            description: "Normalized quote data",
          },
          comparisonMetrics: {
            type: "object",
            description: "Metrics from comparison",
          },
        },
        required: ["normalizedQuotes", "comparisonMetrics"],
      },
      handler: async (params) => {
        const quotes = params.normalizedQuotes;
        const metrics = params.comparisonMetrics;

        // Find best value (not just lowest premium)
        const sortedByPremium = [...quotes].sort((a, b) => a.premium - b.premium);
        const lowestQuote = sortedByPremium[0];
        const highestQuote = sortedByPremium[sortedByPremium.length - 1];

        const summary = {
          overview: `We have compiled ${quotes.length} competitive quotes for your General Liability insurance coverage. Premium quotes range from $${metrics.lowestPremium.toLocaleString()} to $${metrics.highestPremium.toLocaleString()} annually, with an average of $${Math.round(metrics.averagePremium).toLocaleString()}.`,

          recommendation: lowestQuote.carrier === highestQuote.carrier
            ? `All carriers offer similar coverage at competitive rates. We recommend ${lowestQuote.carrier} for the best value.`
            : `${lowestQuote.carrier} offers the most competitive premium at $${lowestQuote.premium.toLocaleString()}, while ${highestQuote.carrier} provides the most comprehensive coverage with additional endorsements.`,

          keyDifferences: quotes.map((q: any, idx: number) => ({
            carrier: q.carrier,
            premium: q.premium,
            uniqueFeatures: q.additionalCoverages || [],
            deductible: q.deductibles["Per Claim"] || "Standard",
          })),

          nextSteps: [
            "Review the detailed comparison below",
            "Consider your risk tolerance and budget",
            "Schedule a call to discuss any questions",
            "Select your preferred carrier to proceed with binding",
          ],
        };

        return summary;
      },
    });

    // Tool: Create comparison table
    this.registerTool({
      name: "create_comparison_table",
      description: "Create a detailed comparison table of all quotes",
      input_schema: {
        type: "object",
        properties: {
          normalizedQuotes: {
            type: "array",
            description: "Normalized quote data",
          },
        },
        required: ["normalizedQuotes"],
      },
      handler: async (params) => {
        const quotes = params.normalizedQuotes;

        // Extract all unique coverage fields
        const allFields = new Set<string>();
        quotes.forEach((q: any) => {
          Object.keys(q.limits || {}).forEach((field) => allFields.add(field));
        });

        const comparisonTable = {
          headers: ["Coverage", ...quotes.map((q: any) => q.carrier)],
          rows: [
            {
              field: "Annual Premium",
              values: quotes.map((q: any) => `$${q.premium.toLocaleString()}`),
              highlight: true,
            },
            {
              field: "Effective Date",
              values: quotes.map((q: any) => q.effectiveDate),
            },
            ...Array.from(allFields).map((field) => ({
              field,
              values: quotes.map((q: any) => q.limits[field] || "Not included"),
            })),
            {
              field: "Deductible",
              values: quotes.map((q: any) => q.deductibles["Per Claim"] || "N/A"),
            },
          ],
        };

        return comparisonTable;
      },
    });

    // Tool: Generate proposal document
    this.registerTool({
      name: "render_proposal_document",
      description: "Render the final proposal document with branding",
      input_schema: {
        type: "object",
        properties: {
          clientId: {
            type: "string",
          },
          executiveSummary: {
            type: "object",
            description: "Executive summary content",
          },
          comparisonTable: {
            type: "object",
            description: "Comparison table data",
          },
          format: {
            type: "string",
            enum: ["pdf", "docx", "html"],
            description: "Output format",
          },
        },
        required: ["clientId", "executiveSummary", "comparisonTable"],
      },
      handler: async (params) => {
        // In production, this would:
        // 1. Load client branding from database
        // 2. Use a PDF library (like puppeteer or pdfkit) to generate PDF
        // 3. Upload to S3
        // 4. Store metadata in database
        // 5. Return URL

        const documentId = `proposal-${params.clientId}-${Date.now()}`;
        const url = `/proposals/${documentId}.pdf`;

        console.log("Generated proposal document:", documentId);

        return {
          success: true,
          documentId,
          url,
          format: params.format || "pdf",
          generatedAt: new Date().toISOString(),
        };
      },
    });

    // Tool: Store proposal in database
    this.registerTool({
      name: "store_proposal",
      description: "Store the generated proposal in the database",
      input_schema: {
        type: "object",
        properties: {
          clientId: {
            type: "string",
          },
          quoteIds: {
            type: "array",
            items: { type: "string" },
          },
          documentId: {
            type: "string",
          },
          url: {
            type: "string",
          },
          summary: {
            type: "object",
          },
        },
        required: ["clientId", "quoteIds", "documentId", "url"],
      },
      handler: async (params) => {
        // In production, this would insert into Convex database
        console.log("Storing proposal:", params.documentId);

        return {
          success: true,
          proposalId: params.documentId,
          status: "completed",
        };
      },
    });
  }

  async generateProposal(params: {
    clientId: string;
    quoteIds: string[];
    format?: "pdf" | "docx" | "html";
  }) {
    const messages = [
      {
        role: "user" as const,
        content: `Generate a comprehensive insurance proposal for client ${params.clientId} using the following quotes: ${params.quoteIds.join(", ")}

Please follow this workflow:
1. Load all quotes using load_client_quotes
2. Normalize the data using normalize_quote_data
3. Generate an executive summary using generate_executive_summary
4. Create a detailed comparison table using create_comparison_table
5. Render the final document using render_proposal_document (format: ${params.format || "pdf"})
6. Store the proposal using store_proposal

Provide a clear summary of your findings and recommendations.`,
      },
    ];

    const result = await this.run(messages, {
      maxSteps: 20,
      onStep: (step) => {
        console.log(`Proposal generation step ${step.step}:`, step.stopReason);
      },
    });

    return result;
  }
}

// Export convenience function
export async function generateInsuranceProposal(params: {
  clientId: string;
  quoteIds: string[];
  format?: "pdf" | "docx" | "html";
}) {
  const agent = new ProposalGenerationAgent();
  const result = await agent.generateProposal(params);

  return {
    success: true,
    proposal: result.content,
    steps: result.steps,
  };
}