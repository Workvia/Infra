"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Star, Globe, Tag, Users, MoreHorizontal, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Mock data
const client = {
  id: "1",
  name: "Stack3d Lab",
  domain: "stack3d.com",
  description: "Stack3d Lab develops, licenses, and supports software and services.",
  categories: ["Publishing", "SAAS", "Information Technology"],
  avatar: "S",
  color: "bg-blue-500",
};

const workflows = [
  {
    id: "1",
    name: "Proposal Generation",
    runs: 0,
    status: "Completed",
    lastRun: null,
    isFavorite: false,
    icon: "📝",
  },
  {
    id: "2",
    name: "Policy Checking",
    runs: 0,
    status: "Pending",
    lastRun: null,
    isFavorite: true,
    icon: "🔍",
  },
  {
    id: "3",
    name: "Coverage Check",
    runs: 0,
    status: "Draft",
    lastRun: null,
    isFavorite: false,
    icon: "✓",
  },
  {
    id: "4",
    name: "SOV Builder",
    runs: 0,
    status: "Draft",
    lastRun: null,
    isFavorite: true,
    icon: "📊",
  },
  {
    id: "5",
    name: "Submission Intake",
    runs: 0,
    status: "Draft",
    lastRun: null,
    isFavorite: false,
    icon: "📥",
  },
];

const favoriteWorkflows = [
  {
    id: "1",
    name: "Policy Checking",
    icon: "🔍",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "SOV Builder",
    icon: "📊",
    color: "bg-purple-500",
  },
];

const files = [
  { id: "1", name: "carrier_Quote_2.pdf", type: "pdf" },
  { id: "2", name: "carrier_Quote_2.pdf", type: "pdf" },
  { id: "3", name: "carrier_Quote_2.pdf", type: "pdf" },
  { id: "4", name: "carrier_Quote_2.pdf", type: "pdf" },
];

export default function ClientDetailPage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={`${client.color} text-white`}>
              {client.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {client.name}
              </h1>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Star className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {client.description}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              {/* Client Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client overview</CardTitle>
                  <CardDescription>
                    A overview of the project, goals and outcomes.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Workflows */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>⚙️</span>
                    Workflows
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clients/${params.id}/workflows`}>→</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Workflow</span>
                      <div className="flex items-center gap-8">
                        <span className="text-muted-foreground">Runs</span>
                        <span className="text-muted-foreground">Status</span>
                      </div>
                    </div>
                    {workflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-center justify-between py-3 text-sm hover:bg-muted/50 rounded px-2 -mx-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{workflow.icon}</span>
                          <span className="font-medium">{workflow.name}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="text-muted-foreground w-12 text-center">
                            {workflow.runs}
                          </span>
                          <Badge
                            variant={
                              workflow.status === "Completed"
                                ? "default"
                                : workflow.status === "Pending"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              workflow.status === "Completed"
                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                : workflow.status === "Pending"
                                ? "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
                                : ""
                            }
                          >
                            {workflow.status}
                          </Badge>
                          {workflow.isFavorite && (
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Files */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>📁</span>
                    Files
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clients/${params.id}/files`}>→</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-red-500 text-white text-xs font-semibold">
                          PDF
                        </div>
                        <div className="text-xs text-center truncate w-full">
                          {file.name}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add file
                  </Button>
                </CardContent>
              </Card>

              {/* Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>📊</span>
                    Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clients/${params.id}/activity`}>→</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-2 w-2 rounded-full bg-muted" />
                        <div className="w-px h-full bg-border" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p>
                          <span className="font-medium">Microsoft</span> was created by{" "}
                          <span className="font-medium">Attio syste</span>
                        </p>
                        <p className="text-xs text-muted-foreground">29 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-2 w-2 rounded-full bg-muted" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p>
                          <span className="font-medium">Attio syste</span> changed{" "}
                          <span className="font-medium">Domain</span>
                        </p>
                        <p className="text-xs text-muted-foreground">29 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Details Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Domains</span>
                    </div>
                    <Link
                      href={`https://${client.domain}`}
                      className="text-sm text-blue-600 hover:underline block"
                      target="_blank"
                    >
                      {client.domain}
                    </Link>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name</span>
                    </div>
                    <p className="text-sm">{client.name}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Description</span>
                    </div>
                    <p className="text-sm">{client.description}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Team</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Set a value...
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Categories</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                        Show all values →
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {client.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                          {category}
                        </Badge>
                      ))}
                      <Badge variant="secondary">+3</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>
                Manage automated workflows for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Workflows content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <CardDescription>Documents and files for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Files content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Chat with AI about this client's insurance needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Assistant coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent activity for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Activity feed coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}