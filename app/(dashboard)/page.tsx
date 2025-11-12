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
