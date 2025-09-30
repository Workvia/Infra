import { BaseAgent, AgentConfig } from "./base-agent";
import { DocumentType } from "../types";

const EXTRACTION_SYSTEM_PROMPT = `You are an expert insurance document extraction specialist with deep knowledge of policy structures, carrier formats, and insurance terminology across all 50 states.

Your task: Extract all relevant fields with high confidence and cite source locations.

Extracted fields include:
- Named Insured (person/company name)
- Policy/Quote Number
- Carrier Name
- Line of Business (e.g., GL, Property, Auto, Workers Comp)
- Effective Date
- Expiration Date
- Premium (annual, total)
- Limits of Liability
- Deductibles
- Forms and Endorsements
- Additional Insureds
- Special Conditions

For each field:
- Assign confidence score (0.0-1.0)
  - 1.0 = Exact match, clearly stated
  - 0.7-0.9 = High confidence, reasonable inference
  - 0.5-0.7 = Medium confidence, some ambiguity
  - < 0.5 = Low confidence, unclear or missing
- Provide source location (page, section, line number when possible)
- Flag for human review if confidence < 0.85
- Normalize to standard format

Guidelines:
- Be thorough - extract all available information
- Use insurance domain knowledge to interpret abbreviations
- When uncertain, state why and suggest human review
- Cite exact text from document when possible`;

export class DocumentExtractionAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: "document-extractor",
      description: "Extracts structured insurance data from policies and quotes",
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 4096,
      temperature: 0.3, // Lower temperature for more deterministic extraction
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
    };

    super(config);
    this.registerTools();
  }

  private registerTools() {
    // Tool: Classify document type
    this.registerTool({
      name: "classify_document",
      description: "Classify the type of insurance document (policy, quote, dec page, etc.)",
      input_schema: {
        type: "object",
        properties: {
          documentText: {
            type: "string",
            description: "The full text content of the document",
          },
          metadata: {
            type: "object",
            description: "Optional metadata like filename",
          },
        },
        required: ["documentText"],
      },
      handler: async (params) => {
        // In production, this would use ML classification or heuristics
        // For now, simple keyword matching
        const text = params.documentText.toLowerCase();

        if (
          text.includes("certificate of insurance") ||
          text.includes("certificate holder")
        ) {
          return { type: "certificate", confidence: 0.95 };
        }

        if (text.includes("quotation") || text.includes("quote")) {
          return { type: "carrier_quote", confidence: 0.9 };
        }

        if (
          text.includes("declarations") ||
          text.includes("dec page") ||
          text.includes("declarations page")
        ) {
          return { type: "dec_page", confidence: 0.95 };
        }

        if (
          text.includes("policy number") &&
          (text.includes("effective") || text.includes("expiration"))
        ) {
          return { type: "binded_policy", confidence: 0.85 };
        }

        return { type: "other", confidence: 0.5 };
      },
    });

    // Tool: Extract policy fields
    this.registerTool({
      name: "extract_fields",
      description: "Extract structured fields from the insurance document",
      input_schema: {
        type: "object",
        properties: {
          documentType: {
            type: "string",
            enum: ["carrier_quote", "binded_policy", "dec_page", "other"],
          },
          fieldName: {
            type: "string",
            description: "The name of the field to extract",
          },
          extractedValue: {
            type: "string",
            description: "The extracted value",
          },
          confidence: {
            type: "number",
            description: "Confidence score from 0.0 to 1.0",
          },
          sourceLocation: {
            type: "object",
            properties: {
              page: { type: "number" },
              section: { type: "string" },
              exactText: { type: "string" },
            },
          },
        },
        required: ["fieldName", "extractedValue", "confidence"],
      },
      handler: async (params) => {
        // Store extracted field in database
        // In production, this would call Convex mutation
        return {
          success: true,
          fieldName: params.fieldName,
          value: params.extractedValue,
          confidence: params.confidence,
          needsReview: params.confidence < 0.85,
        };
      },
    });

    // Tool: Validate extracted data
    this.registerTool({
      name: "validate_data",
      description: "Validate extracted data against carrier specifications and business rules",
      input_schema: {
        type: "object",
        properties: {
          fieldName: { type: "string" },
          value: { type: "string" },
          carrier: { type: "string" },
        },
        required: ["fieldName", "value"],
      },
      handler: async (params) => {
        // In production, this would check against carrier specs and validation rules
        const validations: any = {
          isValid: true,
          warnings: [],
        };

        // Example validation: Check date format
        if (params.fieldName.toLowerCase().includes("date")) {
          const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
          if (!datePattern.test(params.value)) {
            validations.warnings.push(
              "Date format may not be standard MM/DD/YYYY"
            );
          }
        }

        // Example validation: Check premium is numeric
        if (params.fieldName.toLowerCase().includes("premium")) {
          const numericValue = parseFloat(
            params.value.replace(/[$,]/g, "")
          );
          if (isNaN(numericValue)) {
            validations.isValid = false;
            validations.warnings.push("Premium value is not numeric");
          }
        }

        return validations;
      },
    });

    // Tool: Store results
    this.registerTool({
      name: "store_extraction_results",
      description: "Store all extracted fields to the database",
      input_schema: {
        type: "object",
        properties: {
          documentId: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fieldName: { type: "string" },
                value: { type: "string" },
                confidence: { type: "number" },
                sourceLocation: { type: "object" },
              },
            },
          },
        },
        required: ["documentId", "fields"],
      },
      handler: async (params) => {
        // In production, this would bulk insert to Convex
        console.log(
          `Storing ${params.fields.length} extracted fields for document ${params.documentId}`
        );

        return {
          success: true,
          storedCount: params.fields.length,
          needsReviewCount: params.fields.filter(
            (f: any) => f.confidence < 0.85
          ).length,
        };
      },
    });
  }

  async extractDocument(documentText: string, documentId: string) {
    const messages = [
      {
        role: "user" as const,
        content: `Please extract all relevant insurance fields from this document. After extraction, store the results.

Document ID: ${documentId}

Document Text:
${documentText}

Instructions:
1. First classify the document type using the classify_document tool
2. Extract all relevant fields using the extract_fields tool for each field
3. Validate important fields using the validate_data tool
4. Store all results using the store_extraction_results tool`,
      },
    ];

    const result = await this.run(messages, {
      maxSteps: 15,
      onStep: (step) => {
        console.log(`Extraction step ${step.step}:`, step.stopReason);
      },
    });

    return result;
  }
}

// Example usage:
export async function extractInsuranceDocument(
  documentText: string,
  documentId: string
) {
  const agent = new DocumentExtractionAgent();
  const result = await agent.extractDocument(documentText, documentId);

  return {
    success: true,
    extractedData: result.content,
    steps: result.steps,
  };
}