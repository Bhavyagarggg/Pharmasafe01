"use client"

import { useMemo, useState } from "react"
import { FefoTable } from "@/components/tables/fefo-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStockPrioritization } from "@/hooks/use-stock"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "moderate", label: "Moderate" },
  { key: "low", label: "Low" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

export default function StockPage() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("all")
  const { data, isLoading } = useStockPrioritization()

  const summary = data?.summary ?? {
    totalBatches: 0,
    totalQuantity: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    expiringSoon: 0,
  }

  const filteredItems = useMemo(() => {
    const items = data?.items ?? []
    if (filter === "all") return items
    return items.filter((item: any) => item.status === filter)
  }, [data?.items, filter])

  function handleDownload() {
    window.open("/api/stock/prioritization?format=csv", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Stock Prioritization</h1>
          <p className="text-sm text-muted-foreground">
            Intelligent FEFO queue ranked by expiry, volume, and handling constraints.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleDownload}>Download CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Stock</Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Add Stock (stub)</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Input id="purchase-date" type="date" />
                <p className="text-xs text-muted-foreground">
                  This demo groups stocks by purchase date. Full persistence can be wired to your database.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total batches" value={summary.totalBatches} description="Tracked lots" />
        <SummaryCard label="Total units" value={summary.totalQuantity} description="Across all batches" />
        <SummaryCard
          label="Expiring ≤30 days"
          value={summary.expiringSoon}
          description="Critical + high"
          tone="warning"
        />
        <SummaryCard label="Critical (expired)" value={summary.critical} description="Needs quarantine" tone="danger" />
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        Last recomputed{" "}
        {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"} • FEFO + storage sensitivity boosts cold-chain
        lots and high-volume items.
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <Button
            key={key}
            type="button"
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <FefoTable items={filteredItems} isLoading={isLoading} activeFilter={filter} />
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: number
  description: string
  tone?: "default" | "warning" | "danger"
}

function SummaryCard({ label, value, description, tone = "default" }: SummaryCardProps) {
  const toneClasses =
    tone === "danger" ? "border-destructive/40" : tone === "warning" ? "border-amber-500/40" : "border-border"
  return (
    <div className={`rounded-lg border bg-background/60 p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
