import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const range = url.searchParams.get("range") || "weekly"
    const format = url.searchParams.get("format")

    const { data: medicines, error } = await supabase.from("medicines").select("*").eq("user_id", session.user.id)

    if (error) {
      console.error("[v0] Reports fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const summary = {
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

    summary.safe = summary.total - summary.expiringSoon - summary.expired

    if (format === "csv") {
      const header = "metric,value,range"
      const rows = Object.entries(summary).map(([k, v]) => `${k},${v},${range}`)
      const csv = [header, ...rows].join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=report-${range}.csv`,
        },
      })
    }

    return NextResponse.json({ summary, range, generatedAt: new Date().toISOString() })
  } catch (error: any) {
    console.error("[v0] Reports GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
