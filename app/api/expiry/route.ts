import { NextResponse } from "next/server"

export async function GET() {
  const kpis = { total: 710, expiringSoon: 58, expired: 12, safe: 640 }
  const distribution = [
    { month: "Jul", count: 10 },
    { month: "Aug", count: 14 },
    { month: "Sep", count: 9 },
    { month: "Oct", count: 16 },
    { month: "Nov", count: 12 },
    { month: "Dec", count: 8 },
  ]
  const forecast = [
    { date: "2025-07", wastage: 5 },
    { date: "2025-08", wastage: 7 },
    { date: "2025-09", wastage: 6 },
    { date: "2025-10", wastage: 8 },
    { date: "2025-11", wastage: 6 },
    { date: "2025-12", wastage: 5 },
  ]
  const recentAlerts = [
    { id: "a1", severity: "amber", title: "Batch PAR-555 expiring", message: "Expires in 28 days" },
    { id: "a2", severity: "red", title: "Batch IBU-101 expired", message: "Remove from stock" },
    { id: "a3", severity: "green", title: "No refrigerator faults", message: "Last 7 days" },
  ]
  return NextResponse.json({ kpis, distribution, forecast, recentAlerts })
}
