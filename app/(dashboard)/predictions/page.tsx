"use client"

import { useMemo, useState } from "react"
import { PredictionsTable } from "@/components/tables/predictions-table"
import { Button } from "@/components/ui/button"
import { usePredictions } from "@/hooks/use-predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FilterKey = "all" | "critical" | "high" | "moderate"

export default function PredictionsPage() {
  const { data, isLoading, mutate } = usePredictions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("all")

  const rows = data?.items ?? []

  const dedupedRows = useMemo(() => {
    const seen = new Set<string>()
    return rows.filter((row: any) => {
      if (seen.has(row.batchId)) return false
      seen.add(row.batchId)
      return true
    })
  }, [rows])

  const stats = useMemo(() => {
    const totals = {
      total: dedupedRows.length,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      averageRisk:
        dedupedRows.length > 0
          ? Math.round(dedupedRows.reduce((sum: number, row: any) => sum + row.risk, 0) / dedupedRows.length)
          : 0,
    }

    dedupedRows.forEach((row: any) => {
      if (row.risk >= 85) totals.critical += 1
      else if (row.risk >= 60) totals.high += 1
      else totals.moderate += 1
    })

    return totals
  }, [dedupedRows])

  const filteredRows = useMemo(() => {
    if (filter === "all") return dedupedRows
    return dedupedRows.filter((row: any) => {
      if (filter === "critical") return row.risk >= 85
      if (filter === "high") return row.risk >= 60 && row.risk < 85
      return row.risk < 60
    })
  }, [dedupedRows, filter])

  async function handleRecompute() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/predictions/recompute", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to recompute predictions")
      }

      await response.json()
      setSuccess(true)

      // Refresh predictions table
      mutate()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message || "An error occurred")
      console.error("Recompute error:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Last updated {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Expiry Predictions</h1>
          <p className="text-sm text-muted-foreground">AI risk signals prioritized by FEFO.</p>
        </div>
        <Button onClick={handleRecompute} variant="default" disabled={loading}>
          {loading ? "Computing..." : "Re-run predictions"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Predictions recomputed successfully!
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tracked batches" value={stats.total} />
        <StatCard label="Critical risk ≥85%" value={stats.critical} tone="danger" />
        <StatCard label="High risk 60-84%" value={stats.high} tone="warning" />
        <StatCard label="Avg. risk score" value={`${stats.averageRisk}%`} />
      </div>

      <div className="rounded-md border bg-muted/20 p-3 text-sm">
        <p>
          {stats.critical + stats.high} batches need immediate attention. Apply filters to focus on the most urgent risk
          tiers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "critical", "high", "moderate"] as FilterKey[]).map((key) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Predictions queue</CardTitle>
        </CardHeader>
        <CardContent>
          <PredictionsTable rows={filteredRows} isLoading={isLoading || loading} />
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number | string
  tone?: "default" | "warning" | "danger"
}) {
  const toneClass =
    tone === "danger" ? "border-destructive/60" : tone === "warning" ? "border-amber-500/40" : "border-border"
  return (
    <Card className={toneClass}>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
