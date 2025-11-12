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
