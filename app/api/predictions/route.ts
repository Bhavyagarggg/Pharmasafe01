import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: predictions, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("risk", { ascending: false })

    if (error) {
      console.error("[v0] Predictions fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      items:
        predictions?.map((p) => ({
          ...p,
          batchId: p.batch_id,
          remainingDays: p.remaining_days,
        })) || [],
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
