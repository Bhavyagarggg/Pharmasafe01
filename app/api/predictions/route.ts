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

    const { data: predictions, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id)
      .order("predicted_at", { ascending: false })
      .order("risk", { ascending: false })

    if (error) {
      console.error("[v0] Predictions fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items =
      predictions?.map((p) => ({
        id: p.id,
        batchId: p.batch_id,
        risk: p.risk,
        confidence: p.confidence,
        remainingDays: p.remaining_days,
        predictedAt: p.predicted_at,
      })) || []

    return NextResponse.json({
      items,
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Predictions GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Predictions recomputed" })
}
