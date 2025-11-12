"use client"

import { useAlerts } from "@/hooks/use-alerts"
import { Button } from "@/components/ui/button"

export function AlertsList({ filter = "all" }: { filter?: "all" | "expiring" | "expired" }) {
  const { data, isLoading, mutate } = useAlerts()
  let alerts = data?.items ?? []
  if (filter === "expiring") alerts = alerts.filter((a: any) => a.severity === "amber")
  if (filter === "expired") alerts = alerts.filter((a: any) => a.severity === "red")

  async function dismiss(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "PATCH", body: JSON.stringify({ dismissed: true }) })
    mutate()
  }

  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No alerts.</p>
      ) : (
        alerts.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
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
              <div>
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.message}</div>
              </div>
            </div>
            {!a.dismissed && (
              <Button size="sm" variant="outline" onClick={() => dismiss(a.id)}>
                Dismiss
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
