"use client"

import { useStockPrioritization } from "@/hooks/use-stock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function FefoTable() {
  const { data, isLoading } = useStockPrioritization()
  const rows = data?.items ?? []
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Priority</TableHead>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No prioritized stock
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r: any, i: number) => (
              <TableRow key={r.batchId}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.batchId}</TableCell>
                <TableCell>{r.expiryDate}</TableCell>
                <TableCell>{r.quantity}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
