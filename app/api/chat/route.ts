import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToCoreMessages } from "ai";
import { loadClientContextFromSupermemory, SupermemoryService } from "@/lib/services/supermemory";
import { searchInsuranceKnowledge } from "@/lib/services/rag";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, clientId, userId, sources } = await req.json();

  // Optionally load client context (CAG) from Supermemory
  let clientContext = "";
  if (clientId) {
    try {
      clientContext = await loadClientContextFromSupermemory(clientId);
    } catch (error) {
      console.error("Failed to load client context from Supermemory:", error);
    }
  }

  // Store user message in Supermemory for conversation history
  if (clientId && userId && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      SupermemoryService.addConversation({
        clientId,
        clientName: `Client-${clientId}`, // In production, fetch from Convex
        userId,
        message: lastMessage.content,
        role: "user",
        context: clientContext ? "Client context loaded" : undefined,
      }).catch(error => {
        console.error("Failed to store user message in Supermemory:", error);
      });
    }
  }

  // Build enhanced system prompt with client context
  const systemPrompt = `You are an expert insurance advisor AI with comprehensive knowledge of:
- Commercial and personal lines insurance
- State-specific regulations and requirements (all 50 states)
- ISO forms, endorsements, and carrier-specific language
- Risk management and coverage analysis

${
  clientContext
    ? `\n## Client Context (CAG - from Supermemory)\n${clientContext.substring(0, 50000)}\n\nUse this context to answer questions about the client's specific insurance needs and documents.`
    : ""
}

Context availability:
- Client documents (CAG): ${clientId ? "Loaded from Supermemory persistent memory" : "Not loaded - select a client to view their documents"}
- Industry knowledge (RAG): Available via search when needed
- Web search: ${sources?.webSearch ? "Enabled" : "Disabled"}

Guidelines:
- ALWAYS cite sources for document-based claims using [cite:doc_name] format
- For industry knowledge, search the knowledge base when needed
- Clearly indicate uncertainty with "Based on available information..." or "This may require verification..."
- Suggest human review for complex legal interpretations
- Explain technical insurance concepts in accessible language
- Provide actionable recommendations, not just information
- When citing client documents, reference the specific document name`;

  const result = streamText({
    model: anthropic("claude-opus-4-5-20250929"), // Use Opus for best quality
    messages: convertToCoreMessages(messages),
    system: systemPrompt,
    maxSteps: 5,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}