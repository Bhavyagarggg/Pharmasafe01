import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const id = params.id
  // pretend we updated
  return NextResponse.json({ ok: true, id, body })
}
