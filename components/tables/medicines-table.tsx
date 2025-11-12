"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function MedicinesTable() {
  const { data, isLoading } = useSWR("/api/medicines", fetcher)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!data?.items) return []
    const q = query.trim().toLowerCase()
    if (!q) return data.items
    return data.items.filter((m: any) => `${m.name} ${m.batchId}`.toLowerCase().includes(q))
  }, [data, query])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <Input id="q" placeholder="Search by name or batch…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Storage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No results
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m: any) => (
                <TableRow key={`${m.batchId}-${m.name}`}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.batchId}</TableCell>
                  <TableCell>{m.purchaseDate}</TableCell>
                  <TableCell>{m.expiryDate}</TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>{m.storage}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
