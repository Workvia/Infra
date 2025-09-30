"use client"

import * as React from "react"
import {
  Building2,
  MessageSquare,
  Workflow,
  Settings2,
  FileText,
  CheckSquare,
  Grid3x3,
  Inbox,
  GitCompare,
  Users,
  Plus,
  Sparkles,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Insurance platform data
const data = {
  user: {
    name: "Insurance Admin",
    email: "admin@via.ai",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Acme",
      logo: Sparkles,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Clients",
      url: "/clients",
      icon: Building2,
      isActive: true,
    },
    {
      title: "Assistant",
      url: "/assistant",
      icon: MessageSquare,
    },
    {
      title: "Workflows",
      url: "/workflows",
      icon: Workflow,
      items: [
        {
          title: "Proposal Generation",
          url: "/workflows/proposal-generation",
        },
        {
          title: "Policy Checking",
          url: "/workflows/policy-checking",
        },
        {
          title: "Coverage Check",
          url: "/workflows/coverage-check",
        },
        {
          title: "SOV Builder",
          url: "/workflows/sov-builder",
        },
        {
          title: "Submission Intake",
          url: "/workflows/submission-intake",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Team",
          url: "/settings/team",
        },
        {
          title: "API Keys",
          url: "/settings/api",
        },
      ],
    },
  ],
  projects: [
    {
      name: "ContrastAI",
      url: "/clients/1",
      icon: "🟣",
    },
    {
      name: "Warpspeed",
      url: "/clients/2",
      icon: "⚡",
    },
    {
      name: "CloudWatch",
      url: "/clients/3",
      icon: "☁️",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
