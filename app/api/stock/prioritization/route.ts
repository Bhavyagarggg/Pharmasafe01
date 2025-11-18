import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

type PrioritizedStock = {
  id: string
  name: string
  batchId: string
  purchaseDate: string
  expiryDate: string
  storage: "Cold" | "Room"
  quantity: number
  daysRemaining: number
  ageDays: number
  status: "critical" | "high" | "moderate" | "low"
  recommendedAction: string
  priorityScore: number
  priority: number
}

const MS_IN_DAY = 1000 * 60 * 60 * 24

export async function GET(req: Request) {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const format = url.searchParams.get("format")

    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Stock prioritization error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const ranked: PrioritizedStock[] =
      medicines
        ?.map((m) => {
          const expiryDate = new Date(m.expiry_date)
          const purchaseDate = new Date(m.purchase_date)
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / MS_IN_DAY)
          const ageDays = Math.max(0, Math.ceil((now.getTime() - purchaseDate.getTime()) / MS_IN_DAY))
          let status: PrioritizedStock["status"]
          if (daysRemaining <= 0) status = "critical"
          else if (daysRemaining <= 30) status = "high"
          else if (daysRemaining <= 90) status = "moderate"
          else status = "low"

          const recommendedAction =
            status === "critical"
              ? "Quarantine immediately"
              : status === "high"
              ? "Dispense first / run promotion"
              : status === "moderate"
              ? "Monitor weekly"
              : "Maintain FEFO rotation"

          const priorityScore =
            daysRemaining +
            (m.storage === "Cold" ? -5 : 0) +
            (status === "high" || status === "critical" ? -3 : 0) +
            (m.quantity >= 100 ? -2 : 0)

          return {
            id: m.id,
            name: m.name,
            batchId: m.batch_id,
            purchaseDate: m.purchase_date,
            expiryDate: m.expiry_date,
            storage: m.storage as "Cold" | "Room",
            quantity: m.quantity,
            daysRemaining,
            ageDays,
            status,
            recommendedAction,
            priorityScore,
            priority: 0,
          }
        }) ?? []

    const items = ranked
      .sort((a, b) => {
        if (a.priorityScore !== b.priorityScore) {
          return a.priorityScore - b.priorityScore
        }
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining
        }
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      })
      .map((item, index) => ({ ...item, priority: index + 1 }))

    const summary = items.reduce(
      (acc, item) => {
        acc.totalBatches += 1
        acc.totalQuantity += item.quantity
        acc[item.status] += 1
        if (item.daysRemaining <= 30) {
          acc.expiringSoon += 1
        }
        return acc
      },
      {
        totalBatches: 0,
        totalQuantity: 0,
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        expiringSoon: 0,
      }
    )

    const updatedAt = new Date().toISOString()

    if (format === "csv") {
      const header = [
        "priority",
        "medicine",
        "batchId",
        "expiryDate",
        "daysRemaining",
        "quantity",
        "storage",
        "status",
        "recommendedAction",
      ].join(",")
      const rows = items.map((r) =>
        [
          r.priority,
          r.name,
          r.batchId,
          r.expiryDate,
          r.daysRemaining,
          r.quantity,
          r.storage,
          r.status,
          `"${r.recommendedAction}"`,
        ].join(",")
      )
      const csv = [header, ...rows].join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=stock-priorities.csv",
        },
      })
    }

    return NextResponse.json({ items, summary, updatedAt })
  } catch (error: any) {
    console.error("[v0] Stock prioritization GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
