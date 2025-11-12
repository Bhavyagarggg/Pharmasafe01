"use client"

import { PredictionsTable } from "@/components/tables/predictions-table"
import { Button } from "@/components/ui/button"

export default function PredictionsPage() {
  async function handleRecompute() {
    try {
      await fetch("/api/predictions/recompute", { method: "POST" })
    } catch (e) {
      // no-op stub
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Expiry Predictions</h1>
          <p className="text-sm text-muted-foreground">AI-predicted expiry risk by batch.</p>
        </div>
        <Button onClick={handleRecompute} variant="default">
          Re-run predictions
        </Button>
      </div>
      <PredictionsTable />
    </div>
  )
}
