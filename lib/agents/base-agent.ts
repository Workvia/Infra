import Anthropic from "@anthropic-ai/sdk";

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt: string;
}

export interface AgentTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}

export class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected tools: Map<string, AgentTool>;

  constructor(config: AgentConfig) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.config = config;
    this.tools = new Map();
  }

  registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.handler(params);
  }

  async run(messages: Anthropic.MessageParam[], options?: {
    maxSteps?: number;
    onStep?: (step: any) => void;
  }): Promise<{
    content: string;
    usage: any;
    steps: number;
  }> {
    const maxSteps = options?.maxSteps || 10;
    let currentMessages = [...messages];
    let steps = 0;
    let finalContent = "";

    while (steps < maxSteps) {
      steps++;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.7,
        system: this.config.systemPrompt,
        messages: currentMessages,
        tools: Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        })),
      });

      options?.onStep?.({
        step: steps,
        stopReason: response.stop_reason,
        content: response.content,
      });

      // Check if agent wants to use tools
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) {
        // No tool use, agent is done
        const textBlock = response.content.find((block) => block.type === "text");
        finalContent = textBlock && "text" in textBlock ? textBlock.text : "";
        break;
      }

      // Execute all tool calls
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolBlock) => {
          if (toolBlock.type !== "tool_use") return null;

          try {
            const result = await this.executeTool(toolBlock.name, toolBlock.input);
            return {
              type: "tool_result" as const,
              tool_use_id: toolBlock.id,
              content: JSON.stringify(result),
            };
          } catch (error) {
            return {
              type: "tool_result" as const,
              tool_use_id: toolBlock.id,
              content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              is_error: true,
            };
          }
        })
      );

      // Add assistant's response and tool results to messages
      currentMessages.push({
        role: "assistant",
        content: response.content,
      });

      currentMessages.push({
        role: "user",
        content: toolResults.filter((r) => r !== null) as any[],
      });

      // If we hit max steps, return last text content
      if (steps >= maxSteps) {
        const textBlock = response.content.find((block) => block.type === "text");
        finalContent = textBlock && "text" in textBlock ? textBlock.text : "";
      }
    }

    return {
      content: finalContent,
      usage: {}, // Would be accumulated from all steps
      steps,
    };
  }
}