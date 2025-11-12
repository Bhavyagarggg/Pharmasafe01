"use client"

import { useReports } from "@/hooks/use-reports"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [range, setRange] = useState<"weekly" | "monthly">("weekly")
  const { data, isLoading } = useReports(range)

  function handleDownloadCSV() {
    window.open(`/api/reports?range=${range}&format=csv`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate summary reports.</p>
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

      <div className="rounded-lg border p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="text-sm">
            <li>Total medicines: {data?.summary?.total ?? 0}</li>
            <li>Expiring soon: {data?.summary?.expiringSoon ?? 0}</li>
            <li>Expired: {data?.summary?.expired ?? 0}</li>
            <li>Safe: {data?.summary?.safe ?? 0}</li>
          </ul>
        )}
      </div>
    </div>
  )
}
