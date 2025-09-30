import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/services/storage";
import { extractInsuranceDocument } from "@/lib/agents/document-extraction-agent";
import { SupermemoryService, addInsuranceDocument } from "@/lib/services/supermemory";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for upload + extraction

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 1. Upload to S3
    const uploadResult = await StorageService.uploadDocument({
      clientId,
      documentId,
      file: buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    console.log("File uploaded to S3:", uploadResult.key);

    // 2. Extract text content (for PDF/DOC files)
    let textContent = "";
    if (file.type === "application/pdf" || file.type.includes("document")) {
      // In production, use a PDF parsing library like pdf-parse or pdfjs
      textContent = "Sample extracted text from document..."; // Placeholder
    } else if (file.type.startsWith("text/")) {
      textContent = buffer.toString("utf-8");
    }

    // 3. Run extraction agent (in background)
    // Don't wait for this to complete - return immediately and process async
    const extractionPromise = extractInsuranceDocument(textContent, documentId)
      .then(async (result) => {
        console.log("Extraction complete:", documentId);

        // 4. Store document in Supermemory for persistent memory
        await addInsuranceDocument({
          clientId,
          clientName: `Client-${clientId}`, // In production, fetch from Convex
          documentId,
          documentName: file.name,
          documentType: documentType || "other",
          content: textContent,
          extractedData: result.extractedData as any,
        });

        console.log("Document added to Supermemory:", documentId);

        // In production, also:
        // - Store extraction results in Convex
        // - Index in vector store for semantic search
        // - Trigger workflow if configured
      })
      .catch((error) => {
        console.error("Extraction failed:", error);
        // Store error state in database
      });

    // Return immediately with upload success
    return NextResponse.json({
      success: true,
      documentId,
      fileName: file.name,
      fileSize: file.size,
      storageUrl: uploadResult.url,
      status: "processing",
      message: "File uploaded successfully. Extraction in progress...",
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get upload status
export async function GET(req: NextRequest) {
  const documentId = req.nextUrl.searchParams.get("documentId");

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  // In production, query Convex for document status
  return NextResponse.json({
    documentId,
    status: "completed", // or "processing", "failed"
    extractedFields: 12,
    needsReview: 2,
  });
}