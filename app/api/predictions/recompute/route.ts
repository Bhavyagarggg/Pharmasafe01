import { createClientServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { predictBatch, type MedicineData } from "@/lib/ml-client"

export async function POST() {
  try {
    const supabase = await createClientServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all medicines for the user
    const { data: medicines, error: medicinesError } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", user.id)

    if (medicinesError) {
      console.error("[v0] Medicines fetch error:", medicinesError)
      return NextResponse.json({ error: medicinesError.message }, { status: 500 })
    }

    if (!medicines || medicines.length === 0) {
      return NextResponse.json({
        ok: true,
        updatedAt: new Date().toISOString(),
        count: 0,
        message: "No medicines found",
      })
    }

    // Transform medicines to ML service format
    const medicinesForML: MedicineData[] = medicines.map((m: any) => ({
      batch_id: m.batch_id,
      purchase_date: m.purchase_date,
      expiry_date: m.expiry_date,
      quantity: m.quantity,
      storage: m.storage as "Cold" | "Room",
    }))

    // Call ML service for predictions
    let predictions
    try {
      predictions = await predictBatch(medicinesForML)
    } catch (mlError: any) {
      console.error("[v0] ML service error:", mlError)
      return NextResponse.json(
        {
          error: "ML prediction service unavailable",
          details: mlError.message,
        },
        { status: 503 }
      )
    }

    // Filter out predictions with errors
    const validPredictions = predictions.filter((p) => !p.error)

    if (validPredictions.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "No valid predictions generated",
        predictions,
      })
    }

    // Delete old predictions for this user
    const { error: deleteError } = await supabase
      .from("predictions")
      .delete()
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("[v0] Delete old predictions error:", deleteError)
      return NextResponse.json(
        { error: "Failed to remove previous predictions before recompute" },
        { status: 500 }
      )
    }

    // Prepare predictions for database insertion
    const predictionsToInsert = validPredictions.map((p) => ({
      batch_id: p.batch_id,
      risk: p.risk,
      confidence: p.confidence,
      remaining_days: p.remaining_days,
      user_id: user.id,
    }))

    // Insert new predictions
    const { error: insertError } = await supabase
      .from("predictions")
      .insert(predictionsToInsert)

    if (insertError) {
      console.error("[v0] Insert predictions error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      count: validPredictions.length,
      total: medicines.length,
    })
  } catch (error: any) {
    console.error("[v0] Predictions recompute error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
