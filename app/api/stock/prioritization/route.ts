import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

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
      .order("expiry_date", { ascending: true })

    if (error) {
      console.error("[v0] Stock prioritization error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items =
      medicines?.map((m, i) => ({
        ...m,
        batchId: m.batch_id,
        expiryDate: m.expiry_date,
        priority: i + 1,
      })) || []

    if (format === "csv") {
      const header = "priority,medicine,batchId,expiryDate,quantity"
      const rows = items.map((r) => `${r.priority},${r.name},${r.batchId},${r.expiryDate},${r.quantity}`)
      const csv = [header, ...rows].join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=fefo.csv",
        },
      })
    }

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error("[v0] Stock prioritization GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
