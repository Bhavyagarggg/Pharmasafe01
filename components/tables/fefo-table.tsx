"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type FefoTableProps = {
  items: any[]
  isLoading: boolean
  activeFilter: string
}

const statusClasses: Record<string, string> = {
  critical: "bg-destructive/15",
  high: "bg-amber-500/10",
  moderate: "bg-blue-500/5",
  low: "",
}

export function FefoTable({ items, isLoading, activeFilter }: FefoTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Priority</TableHead>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Storage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recommended Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-muted-foreground">
                {activeFilter === "all" ? "No prioritized stock" : `No ${activeFilter} batches right now`}
              </TableCell>
            </TableRow>
          ) : (
            items.map((r: any) => (
              <TableRow key={`${r.batchId}-${r.priority}`} className={cn("align-middle", statusClasses[r.status])}>
                <TableCell className="font-semibold">{r.priority}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.batchId}</TableCell>
                <TableCell>{r.expiryDate}</TableCell>
                <TableCell className={r.daysRemaining <= 0 ? "text-destructive" : undefined}>
                  {r.daysRemaining <= 0 ? "Expired" : `${r.daysRemaining} days`}
                </TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.storage}</TableCell>
                <TableCell className="capitalize">{r.status}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.recommendedAction}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
