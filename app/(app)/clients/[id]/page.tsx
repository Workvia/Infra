"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Star, MoreVertical, ChevronRight, Plus, Globe, Building2, FileTextIcon as FileText, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data
const client = {
  id: "1",
  name: "Stack3d Lab",
  domain: "stack3d.com",
  description: "Stack3d Lab develops, licenses, and supports software and services.",
  categories: ["Publishing", "SAAS", "Information T"],
  avatar: "S",
};

const workflows = [
  {
    id: "1",
    name: "Proposal Generation",
    runs: 0,
    status: "Completed",
    statusColor: "bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30",
    iconBg: "bg-[#8B5CF6]/20",
    iconColor: "#8B5CF6",
  },
  {
    id: "2",
    name: "Policy Checking",
    runs: 0,
    status: "Pending",
    statusColor: "bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30",
    iconBg: "bg-[#3B82F6]/20",
    iconColor: "#3B82F6",
  },
  {
    id: "3",
    name: "Coverage Check",
    runs: 0,
    status: "Draft",
    statusColor: "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30",
    iconBg: "bg-[#3B82F6]/20",
    iconColor: "#3B82F6",
  },
  {
    id: "4",
    name: "SOV Builder",
    runs: 0,
    status: "Draft",
    statusColor: "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30",
    iconBg: "bg-[#10B981]/20",
    iconColor: "#10B981",
  },
  {
    id: "5",
    name: "Submission Intake",
    runs: 0,
    status: "Draft",
    statusColor: "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30",
    iconBg: "bg-[#10B981]/20",
    iconColor: "#10B981",
  },
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
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-lg bg-[#4F46E5]">
              <AvatarFallback className="rounded-lg bg-[#4F46E5] text-white text-sm font-semibold">
                {client.avatar}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold">{client.name}</h1>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "assistant", label: "AI Assistant" },
            { id: "workflows", label: "Workflows" },
            { id: "files", label: "Files" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 pt-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Client Overview Section */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Client overview</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              A overview of the project, goals and outcomes.
            </p>
          </div>

          {/* Workflows Section */}
          <div className="mb-8">
            <button className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 8H14M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Workflows</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Workflows Table */}
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Workflow
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Runs
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md ${workflow.iconBg}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8 3V13M3 8H13"
                                stroke={workflow.iconColor}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">{workflow.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{workflow.runs}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${workflow.statusColor} border-0`}>
                          {workflow.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Files Section */}
          <div className="mb-8">
            <button className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <FileText className="h-4 w-4" />
              <span>Files</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-4 gap-4">
              {/* Add File Card */}
              <Card className="flex h-24 items-center justify-center border-2 border-dashed hover:border-muted-foreground hover:bg-accent/50 cursor-pointer bg-transparent">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </Card>

              {/* PDF File Cards */}
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="group relative h-24 bg-card p-3 hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#DC2626]">
                        <span className="text-[10px] font-bold text-white">PDF</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{file.name}</p>
                      </div>
                    </div>
                    <button className="text-left text-xs text-muted-foreground hover:text-foreground">
                      Download
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <button className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3V8L11 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Activity</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <button className="mt-1 text-muted-foreground hover:text-foreground">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 12L8 4M4 8L8 4L12 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}

              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <span>View all</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Client Details */}
        <div className="w-80 border-l bg-muted/5 overflow-auto">
          <div className="p-6">
            <div className="mb-6 flex items-center gap-4 border-b">
              <button className="border-b-2 border-foreground pb-3 text-sm font-medium">
                Details
              </button>
              <button className="pb-3 text-sm text-muted-foreground hover:text-foreground">
                Comments
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold">Client Details</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Domains</p>
                    <a
                      href={`https://${client.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#3B82F6] hover:underline"
                    >
                      {client.domain}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium">{client.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm font-medium">{client.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Team</p>
                    <p className="text-sm text-muted-foreground">Set a value...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30 border-0">
                        Publishing
                      </Badge>
                      <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 border-0">
                        SAAS
                      </Badge>
                      <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 border-0">
                        Information T
                      </Badge>
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-0">
                        +3
                      </Badge>
                    </div>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <span>Show all values</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}