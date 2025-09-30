import { NextRequest, NextResponse } from "next/server";
import { comparePolicies } from "@/lib/agents/policy-comparison-agent";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes for policy comparison

export async function POST(req: NextRequest) {
  try {
    const { clientId, policy1Id, policy2Id } = await req.json();

    if (!clientId || !policy1Id || !policy2Id) {
      return NextResponse.json(
        {
          error: "Missing required fields: clientId, policy1Id, and policy2Id",
        },
        { status: 400 }
      );
    }

    // Run the policy comparison agent
    const result = await comparePolicies({
      clientId,
      policy1Id,
      policy2Id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Policy comparison error:", error);
    return NextResponse.json(
      {
        error: "Failed to compare policies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}