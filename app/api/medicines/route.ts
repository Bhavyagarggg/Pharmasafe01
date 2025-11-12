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

    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", user.id)
      .order("expiry_date", { ascending: true })

    if (error) {
      console.error("[v0] Medicines fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      items:
        medicines?.map((m) => ({
          ...m,
          batchId: m.batch_id,
          purchaseDate: m.purchase_date,
          expiryDate: m.expiry_date,
        })) || [],
    })
  } catch (error: any) {
    console.error("[v0] Medicines GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const fields = ["name", "batchId", "purchaseDate", "expiryDate", "quantity", "storage"] as const
    const missing = fields.filter((f) => !body?.[f] && body?.[f] !== 0)

    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 })
    }

    if (typeof body.quantity !== "number" || body.quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be positive number" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("medicines")
      .insert({
        name: body.name,
        batch_id: body.batchId,
        purchase_date: body.purchaseDate,
        expiry_date: body.expiryDate,
        quantity: body.quantity,
        storage: body.storage,
        user_id: user.id,
      })
      .select()

    if (error) {
      console.error("[v0] Medicine insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Medicines POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
