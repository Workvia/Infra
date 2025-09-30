"use client";

import * as React from "react";
import { Plus, Search, Filter, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock data matching the screenshot
const clients = [
  {
    id: "1",
    name: "Stack3d Lab",
    domain: "stack3dlab.com",
    status: "Active",
    role: "Product Designer",
    email: "olivia@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 4,
    avatar: "S",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "ContrastAI",
    domain: "contrastai.com",
    status: "Active",
    role: "Product Manager",
    email: "phoenix@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 4,
    avatar: "C",
    color: "bg-purple-500",
  },
  {
    id: "3",
    name: "Ephemeral",
    domain: "ephemeral.io",
    status: "Active",
    role: "Frontend Developer",
    email: "lana@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 2,
    avatar: "E",
    color: "bg-blue-400",
  },
  {
    id: "4",
    name: "Warpspeed",
    domain: "getwarpspeed.com",
    status: "Active",
    role: "Backend Developer",
    email: "demi@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 1,
    avatar: "W",
    color: "bg-gray-600",
  },
  {
    id: "5",
    name: "CloudWatch",
    domain: "cloudwatch.app",
    status: "Active",
    role: "Fullstack Developer",
    email: "candice@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 2,
    avatar: "C",
    color: "bg-blue-500",
  },
  {
    id: "6",
    name: "Convergence",
    domain: "convergence.io",
    status: "Active",
    role: "UX Designer",
    email: "natali@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 2,
    avatar: "✦",
    color: "bg-gray-700",
  },
  {
    id: "7",
    name: "Sisyphus",
    domain: "sisyphus.com",
    status: "Active",
    role: "UX Copywriter",
    email: "drew@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 4,
    avatar: "S",
    color: "bg-green-500",
  },
  {
    id: "8",
    name: "Ephemeral",
    domain: "ephemeral.io",
    status: "Active",
    role: "UI Designer",
    email: "orlando@untitledui.com",
    teams: ["Design", "Product", "Marketing"],
    teamCount: 4,
    avatar: "E",
    color: "bg-blue-400",
  },
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white text-xs">
              📋
            </span>
            Clients
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Import from CSV</DropdownMenuItem>
              <DropdownMenuItem>Import from AMS</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-green-500 text-white text-xs mr-2">
                    ✓
                  </span>
                  All Clients
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked>
                  All Clients
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Active</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email address</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients
              .filter((client) =>
                client.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/clients/${client.id}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${client.color} text-white text-xs`}>
                            {client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.domain}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <span className="mr-1">●</span> {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.role}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {client.teams.slice(0, 3).map((team) => (
                        <Badge
                          key={team}
                          variant="secondary"
                          className="bg-blue-500 text-white text-xs hover:bg-blue-600"
                        >
                          {team}
                        </Badge>
                      ))}
                      {client.teamCount > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          +{client.teamCount - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Page 1 of 14</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}