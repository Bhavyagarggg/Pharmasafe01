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

    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("dismissed", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Alerts fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: alerts || [] })
  } catch (error: any) {
    console.error("[v0] Alerts GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const alertId = new URL(req.url).searchParams.get("id")

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("alerts")
      .update({ dismissed: body.dismissed ?? true })
      .eq("id", alertId)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("[v0] Alert update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[v0] Alerts PATCH error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
