"use client";

import * as React from "react";
import { Search, MessageSquare, Globe, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [message, setMessage] = React.useState("");
  const [webSearch, setWebSearch] = React.useState(true);
  const [appsIntegrations, setAppsIntegrations] = React.useState(true);
  const [selectedClients, setSelectedClients] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Chat History Sidebar */}
      <div className="w-64 flex flex-col border-r pr-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white text-xs">
                🤖
              </span>
              AI Assistant
            </h2>
          </div>

          <Button className="w-full" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            New chat
          </Button>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats" className="pl-8" />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Previous</h3>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-1">
                {previousChats.map((chat, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal h-auto py-2"
                  >
                    <span className="truncate">{chat}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full text-center space-y-6 p-8">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white text-2xl">
                🤖
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">No chats found</h1>
              <p className="text-muted-foreground">
                Looks like you haven't started a chat yet.
              </p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Sources Panel */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Sources</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Web search</span>
                    </div>
                    <Button
                      variant={webSearch ? "default" : "outline"}
                      size="sm"
                      className="h-6 rounded-full"
                      onClick={() => setWebSearch(!webSearch)}
                    >
                      {webSearch ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      <span className="text-sm">Apps and integrations</span>
                    </div>
                    <Button
                      variant={appsIntegrations ? "default" : "outline"}
                      size="sm"
                      className="h-6 rounded-full"
                      onClick={() => setAppsIntegrations(!appsIntegrations)}
                    >
                      {appsIntegrations ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Clients</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => {
                            setSelectedClients((prev) =>
                              prev.includes(client.id)
                                ? prev.filter((id) => id !== client.id)
                                : [...prev, client.id]
                            );
                          }}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-sm">
                            {client.icon}
                          </div>
                          <span className="text-sm">{client.name}</span>
                          {selectedClients.includes(client.id) && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Message Input */}
            <div className="relative">
              <Input
                placeholder="Ask anything"
                className="pr-20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  📎
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  <span className="text-xs">Sources</span>
                </Button>
                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}