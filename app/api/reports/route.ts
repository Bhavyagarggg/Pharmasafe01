import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") || "weekly"
  const format = searchParams.get("format")

  const summary = { total: 710, expiringSoon: 58, expired: 12, safe: 640 }
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

  return NextResponse.json({ summary, range })
}
