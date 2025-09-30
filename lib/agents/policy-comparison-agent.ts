import { BaseAgent, AgentConfig } from "./base-agent";
import { Id } from "@/convex/_generated/dataModel";

const COMPARISON_SYSTEM_PROMPT = `You are an expert insurance policy analyst specializing in comparative analysis and material change detection.

Your task:
1. Load both policies from the database
2. Align comparable fields (coverage, limits, deductibles, forms, conditions, exclusions)
3. Identify material changes: NEW (added in policy 2), REMOVED (in policy 1 but not 2), MODIFIED (changed values)
4. Assess impact of each change:
   - HIGH: Coverage reductions, new exclusions, significant limit decreases, major premium increases
   - MEDIUM: Sublimit changes, deductible modifications, form updates
   - LOW: Administrative updates, contact changes, non-material endorsements
5. Generate executive summary with actionable insights

Critical Guidelines:
- ALWAYS cite source locations for detected changes (page, section, line when possible)
- Focus on material changes that affect coverage
- Explain impact in client-friendly language
- Flag ambiguous changes for human review
- Consider both favorable and unfavorable changes
- Highlight cost vs. coverage tradeoffs

Change Categories to Detect:
- Limits of liability (aggregate, per occurrence, etc.)
- Deductibles and self-insured retentions
- Premium changes
- Coverage extensions or restrictions
- Exclusions added or removed
- Territory changes
- Named insureds
- Additional insureds
- Forms and endorsements
- Policy period
- Retroactive dates`;

export interface PolicyData {
  documentId: Id<"documents">;
  policyNumber: string;
  carrier: string;
  namedInsured: string;
  effectiveDate: string;
  expirationDate: string;
  premium: number;
  limits: Record<string, string | number>;
  deductibles: Record<string, string | number>;
  forms: string[];
  endorsements: string[];
  exclusions?: string[];
  additionalInsureds?: string[];
  territory?: string;
}

export interface MaterialChange {
  field: string;
  changeType: "new" | "removed" | "modified";
  impact: "high" | "medium" | "low";
  policy1Value: string | number | null;
  policy2Value: string | number | null;
  description: string;
  recommendation?: string;
  sourceLocation?: {
    policy1?: string;
    policy2?: string;
  };
}

export class PolicyComparisonAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: "policy-comparator",
      description: "Performs side-by-side policy comparison with material change detection",
      model: "claude-sonnet-4-5-20250929",
      maxTokens: 8192,
      temperature: 0.3, // Lower temperature for more consistent analysis
      systemPrompt: COMPARISON_SYSTEM_PROMPT,
    };

    super(config);
    this.registerTools();
  }

  private registerTools() {
    // Tool: Load policies
    this.registerTool({
      name: "load_policies",
      description: "Load both policies from the database for comparison",
      input_schema: {
        type: "object",
        properties: {
          policy1Id: {
            type: "string",
            description: "First policy document ID (typically the expiring policy)",
          },
          policy2Id: {
            type: "string",
            description: "Second policy document ID (typically the renewal policy)",
          },
        },
        required: ["policy1Id", "policy2Id"],
      },
      handler: async (params) => {
        // In production, this would load from Convex and S3

        // Mock data for demonstration
        const policy1: PolicyData = {
          documentId: params.policy1Id as Id<"documents">,
          policyNumber: "GL-2024-001",
          carrier: "Acme Insurance",
          namedInsured: "Tech Startup Inc.",
          effectiveDate: "01/01/2024",
          expirationDate: "01/01/2025",
          premium: 5000,
          limits: {
            "General Aggregate": "$2,000,000",
            "Products/Completed Operations": "$2,000,000",
            "Personal & Advertising Injury": "$1,000,000",
            "Each Occurrence": "$1,000,000",
            "Fire Damage": "$50,000",
          },
          deductibles: {
            "Per Claim": "$2,500",
          },
          forms: ["CG 00 01 04 13", "CG 00 02 04 13"],
          endorsements: ["Additional Insured - Owners, Lessees"],
          exclusions: ["Cyber Liability", "Professional Services"],
          additionalInsureds: ["Building Owner LLC"],
          territory: "United States",
        };

        const policy2: PolicyData = {
          documentId: params.policy2Id as Id<"documents">,
          policyNumber: "GL-2025-001",
          carrier: "Acme Insurance",
          namedInsured: "Tech Startup Inc.",
          effectiveDate: "01/01/2025",
          expirationDate: "01/01/2026",
          premium: 5500,
          limits: {
            "General Aggregate": "$2,000,000",
            "Products/Completed Operations": "$2,000,000",
            "Personal & Advertising Injury": "$1,000,000",
            "Each Occurrence": "$1,000,000",
            "Fire Damage": "$100,000", // INCREASED
            "Medical Payments": "$10,000", // NEW
          },
          deductibles: {
            "Per Claim": "$5,000", // INCREASED
          },
          forms: ["CG 00 01 04 13", "CG 00 02 04 13", "CG 04 38"], // NEW FORM
          endorsements: [
            "Additional Insured - Owners, Lessees",
            "Waiver of Subrogation", // NEW
          ],
          exclusions: ["Cyber Liability", "Professional Services", "Pollution"], // NEW EXCLUSION
          additionalInsureds: ["Building Owner LLC", "Property Manager Inc."], // ADDED
          territory: "United States",
        };

        return {
          success: true,
          policy1,
          policy2,
        };
      },
    });

    // Tool: Align policy fields
    this.registerTool({
      name: "align_policy_fields",
      description: "Align and normalize fields from both policies for comparison",
      input_schema: {
        type: "object",
        properties: {
          policy1: {
            type: "object",
            description: "First policy data",
          },
          policy2: {
            type: "object",
            description: "Second policy data",
          },
        },
        required: ["policy1", "policy2"],
      },
      handler: async (params) => {
        const { policy1, policy2 } = params;

        // Get all unique field names across both policies
        const allLimits = new Set([
          ...Object.keys(policy1.limits || {}),
          ...Object.keys(policy2.limits || {}),
        ]);

        const allDeductibles = new Set([
          ...Object.keys(policy1.deductibles || {}),
          ...Object.keys(policy2.deductibles || {}),
        ]);

        const alignedFields = {
          basicInfo: [
            { field: "Policy Number", policy1: policy1.policyNumber, policy2: policy2.policyNumber },
            { field: "Carrier", policy1: policy1.carrier, policy2: policy2.carrier },
            { field: "Named Insured", policy1: policy1.namedInsured, policy2: policy2.namedInsured },
            { field: "Effective Date", policy1: policy1.effectiveDate, policy2: policy2.effectiveDate },
            { field: "Expiration Date", policy1: policy1.expirationDate, policy2: policy2.expirationDate },
            { field: "Annual Premium", policy1: `$${policy1.premium}`, policy2: `$${policy2.premium}` },
          ],
          limits: Array.from(allLimits).map((limit) => ({
            field: limit,
            policy1: policy1.limits[limit] || "Not included",
            policy2: policy2.limits[limit] || "Not included",
          })),
          deductibles: Array.from(allDeductibles).map((deductible) => ({
            field: deductible,
            policy1: policy1.deductibles[deductible] || "Not included",
            policy2: policy2.deductibles[deductible] || "Not included",
          })),
          forms: {
            policy1: policy1.forms || [],
            policy2: policy2.forms || [],
          },
          endorsements: {
            policy1: policy1.endorsements || [],
            policy2: policy2.endorsements || [],
          },
          exclusions: {
            policy1: policy1.exclusions || [],
            policy2: policy2.exclusions || [],
          },
          additionalInsureds: {
            policy1: policy1.additionalInsureds || [],
            policy2: policy2.additionalInsureds || [],
          },
        };

        return {
          success: true,
          alignedFields,
        };
      },
    });

    // Tool: Detect material changes
    this.registerTool({
      name: "detect_material_changes",
      description: "Identify all material changes between the two policies",
      input_schema: {
        type: "object",
        properties: {
          alignedFields: {
            type: "object",
            description: "Aligned field data from both policies",
          },
        },
        required: ["alignedFields"],
      },
      handler: async (params) => {
        const { alignedFields } = params;
        const changes: MaterialChange[] = [];

        // Check premium change
        const premium1 = parseInt(alignedFields.basicInfo.find((f: any) => f.field === "Annual Premium")?.policy1.replace(/[$,]/g, "") || "0");
        const premium2 = parseInt(alignedFields.basicInfo.find((f: any) => f.field === "Annual Premium")?.policy2.replace(/[$,]/g, "") || "0");

        if (premium1 !== premium2) {
          const percentChange = ((premium2 - premium1) / premium1) * 100;
          changes.push({
            field: "Annual Premium",
            changeType: "modified",
            impact: percentChange > 20 ? "high" : percentChange > 10 ? "medium" : "low",
            policy1Value: premium1,
            policy2Value: premium2,
            description: `Premium ${premium2 > premium1 ? "increased" : "decreased"} by ${Math.abs(percentChange).toFixed(1)}% from $${premium1.toLocaleString()} to $${premium2.toLocaleString()}`,
            recommendation: premium2 > premium1 && percentChange > 15
              ? "Significant premium increase - review what coverage changes justify this cost"
              : undefined,
          });
        }

        // Check limit changes
        alignedFields.limits.forEach((limit: any) => {
          const val1 = limit.policy1;
          const val2 = limit.policy2;

          if (val1 === "Not included" && val2 !== "Not included") {
            changes.push({
              field: `Limit: ${limit.field}`,
              changeType: "new",
              impact: "medium",
              policy1Value: null,
              policy2Value: val2,
              description: `New limit added: ${limit.field} = ${val2}`,
            });
          } else if (val1 !== "Not included" && val2 === "Not included") {
            changes.push({
              field: `Limit: ${limit.field}`,
              changeType: "removed",
              impact: "high",
              policy1Value: val1,
              policy2Value: null,
              description: `Limit removed: ${limit.field} (was ${val1})`,
              recommendation: "IMPORTANT: This coverage limit has been removed. Verify this is intentional.",
            });
          } else if (val1 !== val2) {
            // Parse values to compare
            const num1 = parseFloat(String(val1).replace(/[$,]/g, ""));
            const num2 = parseFloat(String(val2).replace(/[$,]/g, ""));

            if (!isNaN(num1) && !isNaN(num2)) {
              const isIncrease = num2 > num1;
              changes.push({
                field: `Limit: ${limit.field}`,
                changeType: "modified",
                impact: isIncrease ? "low" : "high",
                policy1Value: val1,
                policy2Value: val2,
                description: `${limit.field} ${isIncrease ? "increased" : "decreased"} from ${val1} to ${val2}`,
                recommendation: !isIncrease ? "Coverage reduced - ensure this meets your risk requirements" : undefined,
              });
            }
          }
        });

        // Check deductible changes
        alignedFields.deductibles.forEach((deductible: any) => {
          const val1 = deductible.policy1;
          const val2 = deductible.policy2;

          if (val1 !== val2 && val1 !== "Not included" && val2 !== "Not included") {
            const num1 = parseFloat(String(val1).replace(/[$,]/g, ""));
            const num2 = parseFloat(String(val2).replace(/[$,]/g, ""));

            if (!isNaN(num1) && !isNaN(num2)) {
              const isIncrease = num2 > num1;
              changes.push({
                field: `Deductible: ${deductible.field}`,
                changeType: "modified",
                impact: isIncrease ? "medium" : "low",
                policy1Value: val1,
                policy2Value: val2,
                description: `${deductible.field} deductible ${isIncrease ? "increased" : "decreased"} from ${val1} to ${val2}`,
                recommendation: isIncrease ? "Higher deductible means more out-of-pocket cost per claim" : undefined,
              });
            }
          }
        });

        // Check new/removed forms
        const forms1 = new Set(alignedFields.forms.policy1);
        const forms2 = new Set(alignedFields.forms.policy2);

        Array.from(forms2).forEach((form) => {
          if (!forms1.has(form)) {
            changes.push({
              field: "Forms",
              changeType: "new",
              impact: "medium",
              policy1Value: null,
              policy2Value: form,
              description: `New form added: ${form}`,
            });
          }
        });

        Array.from(forms1).forEach((form) => {
          if (!forms2.has(form)) {
            changes.push({
              field: "Forms",
              changeType: "removed",
              impact: "medium",
              policy1Value: form,
              policy2Value: null,
              description: `Form removed: ${form}`,
            });
          }
        });

        // Check new/removed exclusions
        const excl1 = new Set(alignedFields.exclusions.policy1);
        const excl2 = new Set(alignedFields.exclusions.policy2);

        Array.from(excl2).forEach((exclusion) => {
          if (!excl1.has(exclusion)) {
            changes.push({
              field: "Exclusions",
              changeType: "new",
              impact: "high",
              policy1Value: null,
              policy2Value: exclusion,
              description: `New exclusion added: ${exclusion}`,
              recommendation: "CRITICAL: New exclusion limits coverage. Review if this affects your operations.",
            });
          }
        });

        Array.from(excl1).forEach((exclusion) => {
          if (!excl2.has(exclusion)) {
            changes.push({
              field: "Exclusions",
              changeType: "removed",
              impact: "low",
              policy1Value: exclusion,
              policy2Value: null,
              description: `Exclusion removed: ${exclusion} (now covered)`,
            });
          }
        });

        return {
          success: true,
          changes,
          summary: {
            totalChanges: changes.length,
            highImpact: changes.filter((c) => c.impact === "high").length,
            mediumImpact: changes.filter((c) => c.impact === "medium").length,
            lowImpact: changes.filter((c) => c.impact === "low").length,
          },
        };
      },
    });

    // Tool: Generate comparison report
    this.registerTool({
      name: "generate_comparison_report",
      description: "Generate a comprehensive comparison report with executive summary",
      input_schema: {
        type: "object",
        properties: {
          policy1: { type: "object" },
          policy2: { type: "object" },
          changes: {
            type: "array",
            description: "Array of material changes",
          },
        },
        required: ["policy1", "policy2", "changes"],
      },
      handler: async (params) => {
        const { policy1, policy2, changes } = params;

        const highImpactChanges = changes.filter((c: MaterialChange) => c.impact === "high");
        const mediumImpactChanges = changes.filter((c: MaterialChange) => c.impact === "medium");

        const report = {
          executiveSummary: {
            overview: `Policy comparison between ${policy1.policyNumber} (expiring) and ${policy2.policyNumber} (renewal) identified ${changes.length} total changes, including ${highImpactChanges.length} high-impact changes that require immediate attention.`,

            keyFindings: [
              ...highImpactChanges.slice(0, 3).map((c: MaterialChange) => c.description),
              changes.length > 3 ? `...and ${changes.length - 3} additional changes` : null,
            ].filter(Boolean),

            recommendations: changes
              .filter((c: MaterialChange) => c.recommendation)
              .map((c: MaterialChange) => c.recommendation),

            overallAssessment:
              highImpactChanges.length > 2
                ? "CAUTION: Multiple high-impact changes detected. Careful review recommended before accepting renewal."
                : highImpactChanges.length > 0
                ? "REVIEW REQUIRED: Some material changes detected that may affect coverage."
                : "ACCEPTABLE: Changes are primarily administrative or favorable to the insured.",
          },

          detailedChanges: {
            highImpact: highImpactChanges,
            mediumImpact: mediumImpactChanges,
            lowImpact: changes.filter((c: MaterialChange) => c.impact === "low"),
          },

          sideByComparison: {
            policy1Summary: {
              policyNumber: policy1.policyNumber,
              carrier: policy1.carrier,
              premium: policy1.premium,
              effectiveDates: `${policy1.effectiveDate} - ${policy1.expirationDate}`,
            },
            policy2Summary: {
              policyNumber: policy2.policyNumber,
              carrier: policy2.carrier,
              premium: policy2.premium,
              effectiveDates: `${policy2.effectiveDate} - ${policy2.expirationDate}`,
            },
          },
        };

        return report;
      },
    });

    // Tool: Store comparison
    this.registerTool({
      name: "store_comparison",
      description: "Store the comparison results in the database",
      input_schema: {
        type: "object",
        properties: {
          clientId: { type: "string" },
          policy1Id: { type: "string" },
          policy2Id: { type: "string" },
          report: { type: "object" },
          changes: { type: "array" },
        },
        required: ["clientId", "policy1Id", "policy2Id", "report"],
      },
      handler: async (params) => {
        // In production, this would insert into Convex
        const comparisonId = `comparison-${Date.now()}`;

        console.log("Storing comparison:", comparisonId);

        return {
          success: true,
          comparisonId,
          status: "completed",
          url: `/comparisons/${comparisonId}.pdf`,
        };
      },
    });
  }

  async compareP policies(params: {
    clientId: string;
    policy1Id: string;
    policy2Id: string;
  }) {
    const messages = [
      {
        role: "user" as const,
        content: `Perform a comprehensive policy comparison for client ${params.clientId}.

Compare policies:
- Policy 1 (Expiring): ${params.policy1Id}
- Policy 2 (Renewal): ${params.policy2Id}

Workflow:
1. Load both policies using load_policies
2. Align all fields using align_policy_fields
3. Detect all material changes using detect_material_changes
4. Generate comprehensive report using generate_comparison_report
5. Store results using store_comparison

Focus on material changes that affect coverage, cost, or risk. Provide clear, actionable recommendations.`,
      },
    ];

    const result = await this.run(messages, {
      maxSteps: 20,
      onStep: (step) => {
        console.log(`Policy comparison step ${step.step}:`, step.stopReason);
      },
    });

    return result;
  }
}

// Export convenience function
export async function comparePolicies(params: {
  clientId: string;
  policy1Id: string;
  policy2Id: string;
}) {
  const agent = new PolicyComparisonAgent();
  const result = await agent.comparePolicies(params);

  return {
    success: true,
    comparison: result.content,
    steps: result.steps,
  };
}