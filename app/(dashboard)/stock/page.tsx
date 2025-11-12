"use client"

import { FefoTable } from "@/components/tables/fefo-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function StockPage() {
  const [open, setOpen] = useState(false)

  function handleDownload() {
    window.open("/api/stock/prioritization?format=csv", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Stock Prioritization</h1>
          <p className="text-sm text-muted-foreground">Prioritize dispensing stock by earliest expiry first.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload}>Download CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Stock</Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Add Stock (stub)</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Input id="purchase-date" type="date" />
                <p className="text-xs text-muted-foreground">
                  This demo groups stocks by purchase date. Full persistence can be wired to your database.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <FefoTable />
    </div>
  )
}
