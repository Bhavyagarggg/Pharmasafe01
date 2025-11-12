"use client"

import { MedicinesTable } from "@/components/tables/medicines-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MedicineForm } from "@/components/medicine-form"
import { useState } from "react"

export default function MedicinesPage() {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Medicines & Batches</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage medicine batches with expiry dates.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Medicine/Batch</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add Medicine / Batch</DialogTitle>
            </DialogHeader>
            <MedicineForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <MedicinesTable />
    </div>
  )
}
