import { NextResponse } from "next/server"

const PREDICTIONS = [
  { batchId: "AMX-001", risk: 72, confidence: 0.86, remainingDays: 40 },
  { batchId: "PAR-555", risk: 63, confidence: 0.81, remainingDays: 28 },
  { batchId: "INS-777", risk: 22, confidence: 0.74, remainingDays: 110 },
]

export async function GET() {
  return NextResponse.json({ items: PREDICTIONS, updatedAt: new Date().toISOString() })
}
