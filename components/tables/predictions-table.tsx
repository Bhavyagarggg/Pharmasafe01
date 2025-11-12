"use client"

import { usePredictions } from "@/hooks/use-predictions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PredictionsTable() {
  const { data, isLoading } = usePredictions()
  const rows = data?.items ?? []

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch ID</TableHead>
            <TableHead>Risk (%)</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Remaining Shelf Life (days)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No predictions
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r: any) => (
              <TableRow
                key={r.batchId}
                className={
                  r.remainingDays <= 0 ? "bg-destructive/15" : r.remainingDays <= 30 ? "bg-accent/20" : undefined
                }
              >
                <TableCell>{r.batchId}</TableCell>
                <TableCell>{r.risk}</TableCell>
                <TableCell>{r.confidence}</TableCell>
                <TableCell>{r.remainingDays}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
