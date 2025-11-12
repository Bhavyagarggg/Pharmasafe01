import { NextResponse } from "next/server"

const ALERTS = [
  {
    id: "al-1",
    severity: "amber",
    title: "Batch PAR-555 expiring soon",
    message: "28 days remaining",
    dismissed: false,
  },
  { id: "al-2", severity: "red", title: "Batch IBU-101 expired", message: "Expired yesterday", dismissed: false },
  { id: "al-3", severity: "green", title: "No storage anomalies", message: "All sensors nominal", dismissed: false },
]

export async function GET() {
  return NextResponse.json({ items: ALERTS })
}
