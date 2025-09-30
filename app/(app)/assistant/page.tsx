"use client";

import * as React from "react";
import { Search, Globe, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// Mock previous chats
const previousChats = [
  "1RM estimation",
  "Insurance terms with open",
  "iPad for business use",
  "Business card layout",
  "Best business card options",
  "Image face swap",
  "Name suggestions for Shaka...",
  "Create vibrant map",
  "Expand image size",
  "Pull up GPay on Samsung",
  "Add CNAME to Vercel",
  "AI Musician PRD",
  "Improving rough draft",
  "Top 10 CRM products",
  "Backyard remodel design",
  "Remove structure and BBQ",
  "Image creation request",
  "Image creation request",
  "VC fundraising cheat sheet",
  "Image modification request",
];

// Mock clients for source selection
const clients = [
  { id: "1", name: "ContrastAI", icon: "🟣" },
  { id: "2", name: "Warpspeed", icon: "⚡" },
  { id: "3", name: "CloudWatch", icon: "☁️" },
  { id: "4", name: "Ephemeral", icon: "🔵" },
  { id: "5", name: "Convergence", icon: "✦" },
  { id: "6", name: "Sisyphus", icon: "🟢" },
];

export default function AssistantPage() {
  const [webSearch, setWebSearch] = React.useState(true);
  const [appsIntegrations, setAppsIntegrations] = React.useState(true);
  const [selectedClients, setSelectedClients] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          clientId: selectedClients[0],
          sources: { webSearch, appsIntegrations },
          files: message.files,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || data.response || "I received your message.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r flex flex-col bg-muted/5">
        <div className="p-4 border-b">
          <Button
            className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            New chat
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats"
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-medium text-muted-foreground">Previous</h3>
            </div>
            <div className="space-y-0.5">
              {previousChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors truncate"
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">No chats found</h2>
                <p className="text-muted-foreground">
                  Looks like you haven't started a chat yet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="border-t bg-background">
          <div className="max-w-3xl mx-auto p-4">
            <PromptInput onSubmit={handleSubmit} accept="image/*" multiple>
              <PromptInputBody>
                <PromptInputAttachments>
                  {(file) => <PromptInputAttachment data={file} />}
                </PromptInputAttachments>
                <PromptInputTextarea placeholder="Ask anything" />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          Attach files
                        </PromptInputActionMenuItem>
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <PromptInputButton>
                          <Globe className="size-4" />
                          Sources
                        </PromptInputButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-80">
                        <div className="p-2 space-y-2">
                          <DropdownMenuCheckboxItem
                            checked={webSearch}
                            onCheckedChange={setWebSearch}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Web search
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={appsIntegrations}
                            onCheckedChange={setAppsIntegrations}
                          >
                            <Grid3x3 className="mr-2 h-4 w-4" />
                            Apps and integrations
                          </DropdownMenuCheckboxItem>
                        </div>

                        <div className="border-t p-2">
                          <div className="relative mb-2">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search clients..."
                              className="pl-8 h-8"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                            Clients
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {filteredClients.map((client) => {
                              const isSelected = selectedClients.includes(client.id);
                              return (
                                <button
                                  key={client.id}
                                  className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-md transition-colors text-left text-sm",
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-accent"
                                  )}
                                  onClick={() => {
                                    setSelectedClients((prev) =>
                                      prev.includes(client.id)
                                        ? prev.filter((id) => id !== client.id)
                                        : [...prev, client.id]
                                    );
                                  }}
                                >
                                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
                                    {client.icon}
                                  </div>
                                  <span className="flex-1">{client.name}</span>
                                  {isSelected && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </PromptInputTools>

                  <PromptInputSubmit
                    status={isLoading ? "streaming" : undefined}
                    disabled={isLoading}
                  />
                </PromptInputToolbar>
              </PromptInputBody>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}