import { NextRequest, NextResponse } from "next/server";
import { generateInsuranceProposal } from "@/lib/agents/proposal-generation-agent";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes for proposal generation

export async function POST(req: NextRequest) {
  try {
    const { clientId, quoteIds, format } = await req.json();

    if (!clientId || !quoteIds || !Array.isArray(quoteIds) || quoteIds.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: clientId and quoteIds (array with at least 1 quote)",
        },
        { status: 400 }
      );
    }

    // Run the proposal generation agent
    const result = await generateInsuranceProposal({
      clientId,
      quoteIds,
      format: format || "pdf",
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Proposal generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate proposal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}