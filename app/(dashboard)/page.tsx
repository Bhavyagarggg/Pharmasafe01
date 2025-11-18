"use client"
export const dynamic = "force-dynamic"

import { KpiCards } from "@/components/kpi-cards"
import { ExpiryDistributionChart } from "@/components/charts/expiry-distribution"
import { WastageForecastChart } from "@/components/charts/wastage-forecast"
import { useExpiryData } from "@/hooks/use-expiry"
import { Suspense } from "react"

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Dashboard Overview</h1>

      <Suspense fallback={<div className="text-muted-foreground">Loading KPIs…</div>}>
        <OverviewContent />
      </Suspense>
    </div>
  )
}

function OverviewContent() {
  const { data, isLoading } = useExpiryData()
  const kpis = data?.kpis || { total: 0, expiringSoon: 0, expired: 0, safe: 0 }
  const storage = data?.storage || { Cold: 0, Room: 0 }
  const severity = data?.severity || { critical: 0, high: 0, moderate: 0, low: 0 }
  const inventoryHealth =
    data?.inventoryHealth || ({ safePercent: 0, riskPercent: 0, score: 0, totalQuantity: 0, atRiskQuantity: 0 } as any)
  const topExpiring = data?.topExpiring || []

  return (
    <div className="space-y-6">
      <KpiCards
        totalMedicines={kpis.total}
        expiringSoon={kpis.expiringSoon}
        expiredStock={kpis.expired}
        safeStock={kpis.safe}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiryDistributionChart loading={isLoading} data={data?.distribution || []} />
        <WastageForecastChart loading={isLoading} data={data?.forecast || []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InventoryHealthCard data={inventoryHealth} loading={isLoading} />
        <StorageBreakdownCard storage={storage} severity={severity} />
        <TopExpiringList items={topExpiring} loading={isLoading} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Recent Alerts</h2>
        <p className="text-sm text-muted-foreground">View all on the Alerts page for full actions.</p>
        {/* Minimal inline list to avoid duplicating alerts page */}
        <ul className="mt-2 space-y-2">
          {(data?.recentAlerts || []).slice(0, 5).map((a: any) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border p-3">
              <a href="/alerts" className="text-sm underline-offset-4 hover:underline">
                {a.title}
              </a>
              <span
                className={`text-xs px-2 py-1 rounded-md ${
                  a.severity === "red"
                    ? "bg-destructive text-destructive-foreground"
                    : a.severity === "amber"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                }`}
                aria-label={`Severity ${a.severity}`}
              >
                {a.severity}
              </span>
            </li>
          ))}
          {!isLoading && (!data?.recentAlerts || data.recentAlerts.length === 0) && (
            <li className="text-sm text-muted-foreground">No recent alerts.</li>
          )}
        </ul>
      </div>
    </div>
  )
}

type InventoryHealth = {
  safePercent: number
  riskPercent: number
  score: number
  totalQuantity: number
  atRiskQuantity: number
}

function InventoryHealthCard({ data, loading }: { data: InventoryHealth; loading?: boolean }) {
  return (
    <div className="rounded-xl border bg-card/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Inventory health score</p>
          <p className="text-3xl font-semibold">{loading ? "…" : data.score}</p>
        </div>
        <span className="text-xs rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-600 dark:text-emerald-300">
          {loading ? "Calculating" : `${data.safePercent}% safe`}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>At-risk stock</span>
          <span>
            {loading ? "…" : data.riskPercent}% ({data.atRiskQuantity} units)
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-destructive"
            style={{ width: `${Math.min(100, data.riskPercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Total units</span>
          <span>{loading ? "…" : data.totalQuantity}</span>
        </div>
      </div>
    </div>
  )
}

function StorageBreakdownCard({
  storage,
  severity,
}: {
  storage: Record<string, number>
  severity: Record<string, number>
}) {
  const total = Object.values(storage).reduce((sum, value) => sum + value, 0) || 1
  const severityTotal = Object.values(severity).reduce((sum, value) => sum + value, 0) || 1
  return (
    <div className="rounded-xl border bg-card/60 p-4 shadow-sm space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Storage mix</p>
        <div className="mt-3 flex gap-4">
          {Object.entries(storage).map(([label, value]) => (
            <div key={label}>
              <p className="text-lg font-semibold">{Math.round((value / total) * 100)}%</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk tiers</p>
        <div className="mt-3 space-y-2">
          {Object.entries(severity).map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{label}</span>
                <span>
                  {value} ({Math.round((value / severityTotal) * 100)}%)
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary/70"
                  style={{ width: `${Math.min(100, Math.round((value / severityTotal) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TopExpiringList({ items, loading }: { items: any[]; loading?: boolean }) {
  return (
    <div className="rounded-xl border bg-card/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">FEFO queue</p>
          <p className="text-lg font-semibold">Next to prioritize</p>
        </div>
        <a href="/stock" className="text-xs text-primary hover:underline">
          View full list
        </a>
      </div>
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming batches.</p>
        ) : (
          items.map((item: any) => (
            <div key={item.batchId} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Batch {item.batchId}</p>
              </div>
              <div className="text-right">
                <p className={item.daysRemaining <= 7 ? "text-destructive font-semibold" : "font-semibold"}>
                  {item.daysRemaining <= 0 ? "Expired" : `${item.daysRemaining}d`}
                </p>
                <p className="text-xs text-muted-foreground">{item.storage}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
