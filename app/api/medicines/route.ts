import { NextResponse } from "next/server"

const MEDICINES = [
  {
    name: "Amoxicillin",
    batchId: "AMX-001",
    purchaseDate: "2025-01-06",
    expiryDate: "2025-11-01",
    quantity: 120,
    storage: "Room",
  },
  {
    name: "Ibuprofen",
    batchId: "IBU-202",
    purchaseDate: "2025-03-12",
    expiryDate: "2025-10-25",
    quantity: 200,
    storage: "Room",
  },
  {
    name: "Insulin",
    batchId: "INS-777",
    purchaseDate: "2025-02-01",
    expiryDate: "2025-12-05",
    quantity: 40,
    storage: "Cold",
  },
  {
    name: "Paracetamol",
    batchId: "PAR-555",
    purchaseDate: "2024-12-11",
    expiryDate: "2025-08-15",
    quantity: 350,
    storage: "Room",
  },
]

export async function GET() {
  return NextResponse.json({ items: MEDICINES })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const fields = ["name", "batchId", "purchaseDate", "expiryDate", "quantity", "storage"] as const
  const missing = fields.filter((f) => !body?.[f] && body?.[f] !== 0)
  if (missing.length) {
    return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 })
  }
  if (typeof body.quantity !== "number" || body.quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be positive number" }, { status: 400 })
  }
  MEDICINES.push(body)
  return NextResponse.json({ ok: true })
}
