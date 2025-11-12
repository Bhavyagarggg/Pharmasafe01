import { NextResponse } from "next/server"

const FEFO = [
  { name: "Paracetamol", batchId: "PAR-555", expiryDate: "2025-08-15", quantity: 350 },
  { name: "Ibuprofen", batchId: "IBU-202", expiryDate: "2025-10-25", quantity: 200 },
  { name: "Amoxicillin", batchId: "AMX-001", expiryDate: "2025-11-01", quantity: 120 },
  { name: "Insulin", batchId: "INS-777", expiryDate: "2025-12-05", quantity: 40 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format")
  if (format === "csv") {
    const header = "priority,medicine,batchId,expiryDate,quantity"
    const rows = FEFO.map((r, i) => `${i + 1},${r.name},${r.batchId},${r.expiryDate},${r.quantity}`)
    const csv = [header, ...rows].join("\n")
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=fefo.csv",
      },
    })
  }
  return NextResponse.json({ items: FEFO })
}
