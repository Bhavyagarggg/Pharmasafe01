import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClientServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))

    const { error } = await supabase
      .from("alerts")
      .update({ dismissed: body.dismissed ?? true })
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("[v0] Alert update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[v0] Alert PATCH error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
