import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiCards({
  totalMedicines,
  expiringSoon,
  expiredStock,
  safeStock,
  loading,
}: {
  totalMedicines: number
  expiringSoon: number
  expiredStock: number
  safeStock: number
  loading?: boolean
}) {
  const kpis = [
    { label: "Total Medicines", value: totalMedicines },
    { label: "Expiring ≤30 days", value: expiringSoon },
    { label: "Expired Stock", value: expiredStock },
    { label: "Safe Stock", value: safeStock },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : k.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
