import { NextRequest, NextResponse } from "next/server";
import { extractInsuranceDocument } from "@/lib/agents/document-extraction-agent";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for document extraction

export async function POST(req: NextRequest) {
  try {
    const { documentText, documentId } = await req.json();

    if (!documentText || !documentId) {
      return NextResponse.json(
        { error: "Missing required fields: documentText and documentId" },
        { status: 400 }
      );
    }

    // Run the extraction agent
    const result = await extractInsuranceDocument(documentText, documentId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Document extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}