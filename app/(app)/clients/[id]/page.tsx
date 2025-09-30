"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Star, MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

// Mock data - matches design
const client = {
  id: "1",
  name: "Stack3d Lab",
  domain: "stack3d.com",
  description: "Stack3d Lab develops, licenses, and supports software and services.",
  categories: ["Publishing", "SAAS", "Information Technology"],
  avatar: "S",
  team: null,
};

const workflows = [
  {
    id: "1",
    name: "Proposal Generation",
    runs: 0,
    status: "Completed",
    statusColor: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: "🔮",
  },
  {
    id: "2",
    name: "Policy Checking",
    runs: 0,
    status: "Pending",
    statusColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    icon: "🔍",
    isFavorite: true,
  },
  {
    id: "3",
    name: "Coverage Check",
    runs: 0,
    status: "Draft",
    statusColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: "✓",
  },
  {
    id: "4",
    name: "SOV Builder",
    runs: 0,
    status: "Draft",
    statusColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: "📊",
    isFavorite: true,
  },
  {
    id: "5",
    name: "Submission Intake",
    runs: 0,
    status: "Draft",
    statusColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: "📥",
  },
];

const favoriteWorkflows = [
  { name: "Policy Checking", steps: 5, icon: "🔵" },
  { name: "SOV Builder", steps: 2, icon: "⚪" },
];

const files = [
  { id: "1", name: "carrier_Quote_2.pdf" },
  { id: "2", name: "carrier_Quote_2.pdf" },
  { id: "3", name: "carrier_Quote_2.pdf" },
  { id: "4", name: "carrier_Quote_2.pdf" },
];

const activities = [
  {
    id: "1",
    action: "Microsoft was created by Attio syste",
    timestamp: "29 minutes ago",
  },
  {
    id: "2",
    action: "Attio syste changed Domain",
    timestamp: "29 minutes ago",
  },
];

export default function ClientDetailPage() {
  const params = useParams();

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header with Avatar and Title */}
        <div className="border-b">
          <div className="flex items-center gap-3 px-6 py-4">
            <Avatar className="h-10 w-10 rounded-lg bg-[#5B5FED]">
              <AvatarFallback className="rounded-lg bg-[#5B5FED] text-white font-medium">
                {client.avatar}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold">{client.name}</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-6">
              <TabsList className="h-10 bg-transparent border-b-0 p-0 space-x-6">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="assistant"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2"
                >
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger
                  value="workflows"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2"
                >
                  Workflows
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2"
                >
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2"
                >
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-0 p-6 space-y-6">
              {/* Client Overview Card */}
              <div className="rounded-lg border bg-card">
                <div className="p-4 space-y-1">
                  <h2 className="text-sm font-medium">Client overview</h2>
                  <p className="text-sm text-muted-foreground">
                    A overview of the project, goals and outcomes.
                  </p>
                </div>
              </div>

              {/* Favorites Section */}
              <div>
                <div className="flex items-center gap-1 mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Favorites</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {favoriteWorkflows.map((workflow, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex gap-1">
                          {Array.from({ length: workflow.steps }).map((_, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded border bg-muted/50 flex items-center justify-center text-xs"
                            >
                              {i === 0 ? workflow.icon : "⚪"}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium">{workflow.name}</p>
                      <Badge variant="secondary" className="mt-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">
                        Draft
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflows Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    <h3 className="text-sm font-medium">Workflows</h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-lg border bg-card overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground font-medium">
                    <div className="col-span-6">Workflow</div>
                    <div className="col-span-2 text-center">Runs</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Workflow Rows */}
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <div className="col-span-6 flex items-center gap-2">
                        <span className="text-lg">{workflow.icon}</span>
                        <span className="text-sm">{workflow.name}</span>
                      </div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">
                        {workflow.runs}
                      </div>
                      <div className="col-span-3">
                        <Badge variant="secondary" className={`${workflow.statusColor} border-0`}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {workflow.isFavorite && (
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Files Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    <h3 className="text-sm font-medium">Files</h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-24 border-dashed hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-2xl">+</div>
                    </div>
                  </Button>
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">PDF</span>
                      </div>
                      <p className="text-xs text-center text-muted-foreground truncate w-full">
                        {file.name}
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h3 className="text-sm font-medium">Activity</h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    View all
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                <div className="rounded-lg border bg-card p-4 space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-transparent"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {index < activities.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Client Details */}
      <div className="w-80 border-l bg-muted/5 overflow-auto">
        <div className="p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="details" className="text-xs">
                Details
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs">
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div>
                <h3 className="text-sm font-semibold mb-4">Client Details</h3>

                <div className="space-y-4">
                  {/* Domains */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Domains</span>
                    </div>
                    <Link
                      href={`https://${client.domain}`}
                      target="_blank"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {client.domain}
                    </Link>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Name</span>
                    </div>
                    <p className="text-sm">{client.name}</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      <span>Description</span>
                    </div>
                    <p className="text-sm">{client.description}</p>
                  </div>

                  {/* Team */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>Team</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-muted-foreground font-normal"
                    >
                      Set a value...
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span>Categories</span>
                      </div>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Show all values →
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="bg-pink-500/90 hover:bg-pink-500 text-white border-0 text-xs px-2 py-0.5">
                        Publishing
                      </Badge>
                      <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                        SAAS
                      </Badge>
                      <Badge className="bg-yellow-500/90 hover:bg-yellow-500 text-white border-0 text-xs px-2 py-0.5">
                        Information T
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        +3
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}