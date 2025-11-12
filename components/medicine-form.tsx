"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMedicines } from "@/hooks/use-medicines"

export function MedicineForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate } = useMedicines()
  const [name, setName] = useState("")
  const [batchId, setBatchId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [quantity, setQuantity] = useState<number | "">("")
  const [storage, setStorage] = useState<"Cold" | "Room" | "">("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !batchId.trim() || !purchaseDate || !expiryDate || !quantity || !storage) {
      setError("All fields are required.")
      return
    }
    if (Number(quantity) <= 0) {
      setError("Quantity must be positive.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          batchId: batchId.trim(),
          purchaseDate,
          expiryDate,
          quantity: Number(quantity),
          storage,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to add medicine")
      }
      mutate()
      onSuccess?.()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label htmlFor="name">Medicine Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Paracetamol" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="batch">Batch ID</Label>
        <Input id="batch" value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="PAR-555" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="purchase">Purchase Date</Label>
        <Input id="purchase" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="expiry">Expiry Date</Label>
        <Input id="expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="qty">Quantity</Label>
        <Input
          id="qty"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="100"
        />
      </div>
      <div className="space-y-1">
        <Label>Storage Type</Label>
        <Select value={storage} onValueChange={(v) => setStorage(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select storage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cold">Cold</SelectItem>
            <SelectItem value="Room">Room</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="md:col-span-2 text-sm text-destructive">{error}</p>}
      <div className="md:col-span-2 flex items-center justify-end gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  )
}
