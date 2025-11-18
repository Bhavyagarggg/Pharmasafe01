"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type PredictionsTableProps = {
  rows: any[]
  isLoading: boolean
}

const riskRowClasses = {
  critical: "bg-destructive/15",
  high: "bg-amber-500/10",
  moderate: "bg-emerald-500/5",
}

function getRiskBand(risk: number) {
  if (risk >= 85) return "critical"
  if (risk >= 60) return "high"
  return "moderate"
}

export function PredictionsTable({ rows, isLoading }: PredictionsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch ID</TableHead>
            <TableHead>Risk (%)</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Remaining Shelf Life</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No predictions
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r: any) => {
              const band = getRiskBand(r.risk)
              return (
                <TableRow
                  key={r.id ?? `${r.batchId}-${r.predictedAt ?? r.remainingDays}`}
                  className={cn("align-middle", riskRowClasses[band as keyof typeof riskRowClasses])}
                >
                  <TableCell className="font-medium">{r.batchId}</TableCell>
                  <TableCell>{r.risk}%</TableCell>
                  <TableCell className="capitalize">{band}</TableCell>
                  <TableCell>{Math.round((r.confidence ?? 0) * 100)}%</TableCell>
                  <TableCell className={r.remainingDays <= 0 ? "text-destructive font-semibold" : undefined}>
                    {r.remainingDays <= 0 ? "Expired" : `${r.remainingDays} days`}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
