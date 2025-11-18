"use client"

import { useMemo, useState } from "react"
import { MedicinesTable } from "@/components/tables/medicines-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MedicineForm } from "@/components/medicine-form"
import { Input } from "@/components/ui/input"
import { useMedicines } from "@/hooks/use-medicines"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "safe" | "expiring" | "expired"
type StorageFilter = "all" | "Cold" | "Room"
type ViewMode = "table" | "cards"

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "safe", label: "Safe" },
  { key: "expiring", label: "Expiring ≤30d" },
  { key: "expired", label: "Expired" },
]

const STORAGE_FILTERS: { key: StorageFilter; label: string }[] = [
  { key: "all", label: "Any storage" },
  { key: "Cold", label: "Cold-chain" },
  { key: "Room", label: "Room temp" },
]

export default function MedicinesPage() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [storageFilter, setStorageFilter] = useState<StorageFilter>("all")
  const [view, setView] = useState<ViewMode>("cards")
  const { data, isLoading } = useMedicines()

  const enriched = useMemo(() => {
    const items = data?.items ?? []
    const now = new Date()
    return items.map((m: any) => {
      const expiry = new Date(m.expiryDate)
      const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const status = daysRemaining <= 0 ? "expired" : daysRemaining <= 30 ? "expiring" : "safe"
      return { ...m, daysRemaining, status }
    })
  }, [data?.items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched.filter((item: any) => {
      const matchesQuery = !q || `${item.name} ${item.batchId}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesStorage = storageFilter === "all" || item.storage === storageFilter
      return matchesQuery && matchesStatus && matchesStorage
    })
  }, [enriched, query, statusFilter, storageFilter])

  const summary = useMemo(() => {
    return {
      total: enriched.length,
      expiring: enriched.filter((m: any) => m.status === "expiring").length,
      expired: enriched.filter((m: any) => m.status === "expired").length,
      coldChain: enriched.filter((m: any) => m.storage === "Cold").length,
    }
  }, [enriched])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Medicines & Batches</h1>
          <p className="text-sm text-muted-foreground">
            Monitor every lot’s shelf life and handling requirements with FEFO-ready views.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Medicine/Batch</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add Medicine / Batch</DialogTitle>
            </DialogHeader>
            <MedicineForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total batches" value={summary.total} description="Active lots" />
        <SummaryCard label="Expiring ≤30 days" value={summary.expiring} description="Prioritize now" tone="warning" />
        <SummaryCard label="Expired" value={summary.expired} description="Needs quarantine" tone="danger" />
        <SummaryCard label="Cold-chain lots" value={summary.coldChain} description="Require special handling" />
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines or batch IDs…"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {STORAGE_FILTERS.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                variant={storageFilter === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStorageFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={view === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("cards")}
            >
              Card view
            </Button>
            <Button
              type="button"
              variant={view === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("table")}
            >
              Table view
            </Button>
          </div>
        </div>
      </div>

      {view === "cards" ? (
        <MedicineCards items={filtered} isLoading={isLoading} />
      ) : (
        <MedicinesTable items={filtered} isLoading={isLoading} />
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string
  value: number
  description: string
  tone?: "default" | "warning" | "danger"
}) {
  const toneClass =
    tone === "danger" ? "border-destructive/60" : tone === "warning" ? "border-amber-500/40" : "border-border"
  return (
    <div className={cn("rounded-xl border bg-card/60 p-4 shadow-sm", toneClass)}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function MedicineCards({ items, isLoading }: { items: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading cards…</p>
  }

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No batches match your filters.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item: any) => (
        <div
          key={item.batchId}
          className={cn(
            "rounded-xl border bg-background/60 p-4 shadow-sm",
            item.status === "expired"
              ? "border-destructive/40"
              : item.status === "expiring"
                ? "border-amber-500/40"
                : "border-border"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Batch {item.batchId}</p>
              <h3 className="text-lg font-semibold">{item.name}</h3>
            </div>
            <StatusBadge status={item.status} daysRemaining={item.daysRemaining} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Expiry</dt>
              <dd>{new Date(item.expiryDate).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Remaining</dt>
              <dd className={item.daysRemaining <= 0 ? "text-destructive font-semibold" : ""}>
                {item.daysRemaining <= 0 ? "Expired" : `${item.daysRemaining} days`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Quantity</dt>
              <dd>{item.quantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Storage</dt>
              <dd>{item.storage}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status, daysRemaining }: { status: string; daysRemaining: number }) {
  const map: Record<string, { label: string; className: string }> = {
    safe: { label: "Safe", className: "bg-emerald-500/15 text-emerald-600" },
    expiring: { label: "Expiring", className: "bg-amber-500/15 text-amber-600" },
    expired: { label: "Expired", className: "bg-destructive/15 text-destructive" },
  }
  const data = map[status] || map.safe
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", data.className)}>
      {data.label} {status !== "safe" ? `(${daysRemaining}d)` : ""}
    </span>
  )
}
