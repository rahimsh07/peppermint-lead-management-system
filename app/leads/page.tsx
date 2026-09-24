"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import {
  type Lead,
  type LeadCategory,
  type LeadStatus,
  CATEGORIES,
  STATUSES,
  dummyLeads,
} from "@/lib/leads"

import { AddEditLeadDialog } from "@/components/dialog/AddEditLeadDialog"
import { useTRPC } from "@/trpc/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import WhatsappIcon from "@/lib/whatsappIcon"

type LeadFormData = Omit<Lead, "id">

export default function LeadsPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery(
    trpc.lead.list.queryOptions()
  )

  const Leads: Lead[] = React.useMemo(() => data as Lead[] || [], [data]);

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<LeadStatus | "All">("All")
  const [categoryFilter, setCategoryFilter] = React.useState<LeadCategory | "All">("All")

  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null)

  const filteredLeads = Leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.mobile.includes(search)

    const matchesStatus =
      statusFilter === "All" ? true : lead.status === statusFilter

    const matchesCategory =
      categoryFilter === "All" ? true : lead.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const deleteMutation = useMutation(
    trpc.lead.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.lead.list.queryFilter())
      },
    })
  )

  function handleWhatsapp(lead: Lead) {
    const phone = `91${lead.mobile.replace(/\D/g, "")}`
    const message = `Hi ${lead.name}, `
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank", "noopener,noreferrer")
  }

  function handleDeleteLead(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return
    deleteMutation.mutate({ id })
  }

  if (isLoading) return <div className="space-y-4 p-4"><p>Loading…</p></div>
  if (error) return <div className="space-y-4 p-4"><p>Error: {error.message}</p></div>

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your leads.
          </p>
        </div>
        <AddEditLeadDialog
          key="add"
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, email or mobile..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as LeadStatus | "All")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as LeadCategory | "All")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.mobile}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    {lead.followUpDate ? (
                      <span className="text-sm">{lead.followUpDate}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        className={"bg-green-500"}
                        onClick={() => handleWhatsapp(lead)}
                      >
                        <WhatsappIcon color={"white"} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingLead(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      {editingLead && (
        <AddEditLeadDialog
          key="edit"
          open={!!editingLead}
          onOpenChange={(open) => !open && setEditingLead(null)}
          lead={{
            id: editingLead.id,
            name: editingLead.name,
            company: editingLead.company,
            mobile: editingLead.mobile,
            email: editingLead.email,
            category: editingLead.category,
            status: editingLead.status,
            followUpDate: editingLead.followUpDate ?? "",
          }}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    "New": "default",
    "Contacted": "secondary",
    "Follow-up": "outline",
    "Converted": "default",
    "Not Interested": "destructive",
  }
  return <Badge variant={map[status]}>{status}</Badge>
}