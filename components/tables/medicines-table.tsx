"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type MedicineRow = {
  id?: string
  name: string
  batchId: string
  purchaseDate: string
  expiryDate: string
  quantity: number
  storage: string
  status?: "safe" | "expiring" | "expired"
  daysRemaining?: number
}

export function MedicinesTable({ items, isLoading }: { items: MedicineRow[]; isLoading: boolean }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Remaining Days</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Storage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground">
                No results
              </TableCell>
            </TableRow>
          ) : (
            items.map((m) => (
              <TableRow
                key={`${m.batchId}-${m.name}`}
                className={cn(
                  m.status === "expired"
                    ? "bg-destructive/10"
                    : m.status === "expiring"
                      ? "bg-amber-500/10"
                      : undefined
                )}
              >
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.batchId}</TableCell>
                <TableCell>{m.purchaseDate}</TableCell>
                <TableCell>{m.expiryDate}</TableCell>
                <TableCell className={m.daysRemaining !== undefined && m.daysRemaining <= 0 ? "text-destructive" : ""}>
                  {m.daysRemaining !== undefined
                    ? m.daysRemaining <= 0
                      ? "Expired"
                      : `${m.daysRemaining}d`
                    : "—"}
                </TableCell>
                <TableCell>{m.quantity}</TableCell>
                <TableCell>{m.storage}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
