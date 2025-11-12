import { NextResponse } from "next/server"

export async function POST() {
  // pretend to update in place
  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() })
}
