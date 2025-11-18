"use client"

import { useMemo, useState } from "react"
import { useReports } from "@/hooks/use-reports"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const numberFormatter = new Intl.NumberFormat("en-IN")

export default function ReportsPage() {
  const [range, setRange] = useState<"weekly" | "monthly">("weekly")
  const { data, isLoading } = useReports(range)

  function handleDownloadCSV() {
    window.open(`/api/reports?range=${range}&format=csv`, "_blank", "noopener,noreferrer")
  }

  const summary = data?.summary ?? { total: 0, expiringSoon: 0, expired: 0, safe: 0, totalQuantity: 0 }
  const severity = data?.breakdown?.severity ?? { critical: 0, high: 0, moderate: 0, low: 0 }
  const storage = data?.breakdown?.storage ?? { Cold: 0, Room: 0 }
  const timeline = data?.timeline ?? []
  const upcoming = data?.upcoming ?? []
  const risk = data?.risk ?? { percentAtRisk: 0, quantityAtRisk: 0 }

  const severityTotal = Object.values(severity).reduce((sum, value) => sum + value, 0) || 1
  const storageTotal = Object.values(storage).reduce((sum, value) => sum + value, 0) || 1

  const lastGenerated = data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"

  const summaryCards = useMemo(
    () => [
      {
        label: "Total medicines",
        value: summary.total,
        description: `${summary.totalQuantity} total units`,
      },
      {
        label: "Expiring ≤30 days",
        value: summary.expiringSoon,
        description: "At-risk lots",
        tone: "warning",
      },
      {
        label: "Already expired",
        value: summary.expired,
        description: "Requires quarantine",
        tone: "danger",
      },
      {
        label: "Safe inventory",
        value: summary.safe,
        description: "Beyond 90 days",
      },
    ],
    [summary]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{lastGenerated}</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Intelligence Reports</h1>
          <p className="text-sm text-muted-foreground">Expiry risk insights for the selected {range} window.</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadCSV}>Download CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={card.tone === "danger" ? "border-destructive/50" : card.tone === "warning" ? "border-amber-500/40" : undefined}>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{numberFormatter.format(card.value)}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Severity breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(severity).map(([label, value]) => (
              <BreakdownRow
                key={label}
                label={label}
                value={value}
                percent={Math.round((value / severityTotal) * 100)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Cold-chain vs room temp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(storage).map(([label, value]) => (
              <BreakdownRow
                key={label}
                label={label}
                value={value}
                percent={Math.round((value / storageTotal) * 100)}
              />
            ))}
            <div className="rounded-md border border-muted-foreground/20 bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {risk.percentAtRisk}% of total units ({numberFormatter.format(risk.quantityAtRisk)} pieces) are at risk within
                this window.
              </p>
              <p className="text-xs text-muted-foreground">Prioritize transferring cold-chain batches first.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Upcoming expiries timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming expiries in this range.</p>
          ) : (
            timeline.map((bucket: any) => (
              <div key={bucket.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{bucket.label}</span>
                  <span>{numberFormatter.format(bucket.quantity)} units</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, bucket.percentOfTotal || 0)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Next batches to watch</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Medicine</th>
                <th>Batch ID</th>
                <th>Expires</th>
                <th>Days left</th>
                <th>Quantity</th>
                <th>Storage</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : upcoming.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    No upcoming expiries in this window.
                  </td>
                </tr>
              ) : (
                upcoming.map((item: any) => (
                  <tr key={item.batchId} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td>{item.batchId}</td>
                    <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td className={item.daysRemaining <= 7 ? "text-destructive font-semibold" : ""}>
                      {item.daysRemaining}d
                    </td>
                    <td>{numberFormatter.format(item.quantity)}</td>
                    <td>{item.storage}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function BreakdownRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize">{label}</span>
        <span>
          {value} ({percent}%)
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-foreground/70" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  )
}
