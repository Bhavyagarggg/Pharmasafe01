import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

const MS_PER_DAY = 1000 * 60 * 60 * 24

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
    const range = (url.searchParams.get("range") || "weekly") as "weekly" | "monthly"
    const format = url.searchParams.get("format")

    const { data: medicines, error } = await supabase.from("medicines").select("*").eq("user_id", user.id)

    if (error) {
      console.error("[v0] Reports fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const bucketSize = range === "weekly" ? 1 : 5
    const bucketCount = range === "weekly" ? 7 : 6
    const timeline = Array.from({ length: bucketCount }).map((_, idx) => {
      const start = idx * bucketSize
      const end = start + bucketSize - 1
      const label =
        range === "weekly" ? `Day ${idx + 1}` : `${start + 1}-${Math.min(end + 1, bucketSize * bucketCount)}d`
      return {
        label,
        start,
        end,
        batches: 0,
        quantity: 0,
        percentOfTotal: 0,
      }
    })

    const baseSummary = {
      total: medicines?.length || 0,
      totalQuantity: medicines?.reduce((sum: number, m: any) => sum + (m.quantity || 0), 0) || 0,
      expiringSoon: 0,
      expired: 0,
      safe: 0,
    }

    const severityBreakdown = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
    }

    const storageBreakdown = {
      Cold: 0,
      Room: 0,
    }

    const upcoming: Array<{
      name: string
      batchId: string
      expiryDate: string
      daysRemaining: number
      quantity: number
      storage: string
    }> = []

    let quantityAtRisk = 0

    medicines?.forEach((m: any) => {
      const expiry = new Date(m.expiry_date)
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / MS_PER_DAY)
      const storage = (m.storage || "Room") as "Cold" | "Room"
      storageBreakdown[storage] += 1

      const severity =
        daysUntilExpiry <= 0 ? "critical" : daysUntilExpiry <= 30 ? "high" : daysUntilExpiry <= 90 ? "moderate" : "low"
      severityBreakdown[severity] += 1

      if (severity === "critical" || severity === "high") {
        quantityAtRisk += m.quantity || 0
      }

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        baseSummary.expiringSoon += 1
      }

      if (daysUntilExpiry <= 0) {
        baseSummary.expired += 1
      }

      if (daysUntilExpiry >= 0) {
        upcoming.push({
          name: m.name,
          batchId: m.batch_id,
          expiryDate: m.expiry_date,
          daysRemaining: daysUntilExpiry,
          quantity: m.quantity,
          storage: m.storage,
        })
      }

      if (daysUntilExpiry >= 0) {
        const relativeDay = Math.min(daysUntilExpiry, bucketSize * bucketCount - 1)
        const bucketIndex = Math.floor(relativeDay / bucketSize)
        const bucket = timeline[bucketIndex]
        bucket.batches += 1
        bucket.quantity += m.quantity || 0
      }
    })

    baseSummary.safe = Math.max(baseSummary.total - baseSummary.expiringSoon - baseSummary.expired, 0)

    const sortedUpcoming = upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 5)
    const totalTimelineQuantity = timeline.reduce((sum, bucket) => sum + bucket.quantity, 0) || 1
    timeline.forEach((bucket) => {
      bucket.percentOfTotal = Math.round((bucket.quantity / totalTimelineQuantity) * 100)
    })

    const risk = {
      quantityAtRisk,
      percentAtRisk: baseSummary.totalQuantity
        ? Math.min(100, Math.round((quantityAtRisk / baseSummary.totalQuantity) * 100))
        : 0,
    }

    if (format === "csv") {
      const header = "metric,value,range"
      const rows = Object.entries(baseSummary).map(([k, v]) => `${k},${v},${range}`)
      const csv = [header, ...rows].join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=report-${range}.csv`,
        },
      })
    }

    return NextResponse.json({
      summary: baseSummary,
      breakdown: { severity: severityBreakdown, storage: storageBreakdown },
      upcoming: sortedUpcoming,
      timeline,
      risk,
      range,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Reports GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
