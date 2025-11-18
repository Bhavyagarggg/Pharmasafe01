import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: medicines, error } = await supabase.from("medicines").select("*").eq("user_id", user.id)

    if (error) {
      console.error("[v0] Medicines fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const kpis = {
      total: medicines?.length || 0,
      expiringSoon:
        medicines?.filter((m) => {
          const expiry = new Date(m.expiry_date)
          const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0
        }).length || 0,
      expired: medicines?.filter((m) => new Date(m.expiry_date) < now).length || 0,
      safe: 0,
    }

    kpis.safe = kpis.total - kpis.expiringSoon - kpis.expired

    const totals = medicines?.reduce(
      (acc: any, m: any) => {
        const expiry = new Date(m.expiry_date)
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        acc.totalQuantity += m.quantity || 0
        acc.storage[m.storage as "Cold" | "Room"] = (acc.storage[m.storage as "Cold" | "Room"] || 0) + 1

        const severity =
          daysUntilExpiry <= 0 ? "critical" : daysUntilExpiry <= 30 ? "high" : daysUntilExpiry <= 90 ? "moderate" : "low"
        acc.severity[severity] = (acc.severity[severity] || 0) + 1

        if (severity === "critical" || severity === "high") {
          acc.atRiskQuantity += m.quantity || 0
        }

        if (daysUntilExpiry >= 0) {
          acc.upcoming.push({
            name: m.name,
            batchId: m.batch_id,
            expiryDate: m.expiry_date,
            daysRemaining: daysUntilExpiry,
            quantity: m.quantity,
            storage: m.storage,
          })
        }

        return acc
      },
      {
        totalQuantity: 0,
        atRiskQuantity: 0,
        storage: { Cold: 0, Room: 0 },
        severity: { critical: 0, high: 0, moderate: 0, low: 0 },
        upcoming: [] as any[],
      }
    ) || {
      totalQuantity: 0,
      atRiskQuantity: 0,
      storage: { Cold: 0, Room: 0 },
      severity: { critical: 0, high: 0, moderate: 0, low: 0 },
      upcoming: [],
    }

    const topExpiring = totals.upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 5)

    const inventoryHealth = {
      safePercent: kpis.total ? Math.max(0, Math.round((kpis.safe / kpis.total) * 100)) : 0,
      riskPercent:
        kpis.total ? Math.min(100, Math.round(((kpis.expiringSoon + kpis.expired) / kpis.total) * 100)) : 0,
      totalQuantity: totals.totalQuantity,
      atRiskQuantity: totals.atRiskQuantity,
      score: kpis.total
        ? Math.max(0, Math.min(100, Math.round((kpis.safe / (kpis.total || 1)) * 100 - kpis.expiringSoon)))
        : 0,
    }

    // Group medicines by month for distribution
    const distribution = groupByMonth(medicines || [])

    // Simple wastage forecast (based on expiring medicines per month)
    const forecast = generateForecast(medicines || [])

    // Generate recent alerts
    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return NextResponse.json({
      kpis,
      distribution,
      forecast,
      recentAlerts: alerts || [],
      storage: totals.storage,
      severity: totals.severity,
      inventoryHealth,
      topExpiring,
    })
  } catch (error: any) {
    console.error("[v0] Expiry GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function groupByMonth(medicines: any[]) {
  const monthMap: Record<string, number> = {}
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  medicines.forEach((m) => {
    const date = new Date(m.expiry_date)
    const month = months[date.getMonth()]
    monthMap[month] = (monthMap[month] || 0) + 1
  })

  return months.map((month) => ({ month, count: monthMap[month] || 0 }))
}

function generateForecast(medicines: any[]) {
  const now = new Date()
  const forecast = []

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const dateStr = `${year}-${month}`

    const wastageCount = medicines.filter((m) => {
      const expiry = new Date(m.expiry_date)
      return expiry.getMonth() === date.getMonth() && expiry.getFullYear() === year
    }).length

    forecast.push({
      date: dateStr,
      wastage: Math.max(1, Math.floor(wastageCount * 0.3)),
    })
  }

  return forecast
}
