import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { loadClientContextFromSupermemory, SupermemoryService } from "@/lib/services/supermemory";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    const { messages, clientId, userId, sources } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error("Messages validation failed:", { messages, isArray: Array.isArray(messages) });
      return new Response(
        JSON.stringify({ error: "Messages array is required", received: body }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
    const systemPrompt = `You are a helpful and knowledgeable AI assistant with expertise in insurance. You can help with:

**Insurance Topics:**
- Commercial and personal lines insurance
- State-specific regulations and requirements (all 50 states)
- ISO forms, endorsements, and carrier-specific language
- Risk management and coverage analysis
- Policy reviews and gap analysis
- Claims guidance and documentation

**General Assistance:**
- Answering questions on any topic
- Writing code and scripts
- Analysis and research
- General problem-solving

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
- Be helpful and answer any question to the best of your ability
- For insurance topics, cite sources when referencing specific documents using [cite:doc_name] format
- Clearly indicate uncertainty with "Based on available information..." or "This may require verification..."
- For complex legal or regulatory interpretations, suggest consulting with a licensed professional
- Explain technical concepts in accessible language
- Provide actionable, practical advice`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"), // Claude 4 Sonnet - best balance of speed and quality
      messages,
      system: systemPrompt,
      maxSteps: 5,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
