import { NextResponse } from "next/server"

import { getBlocksByPage, replaceBlocks } from "@/lib/storage/pages"

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const blocks = await getBlocksByPage(id)
  return NextResponse.json({ blocks })
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body?.userId) {
    return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
  }

  const blocks = Array.isArray(body.blocks) ? body.blocks : []
  await replaceBlocks(id, body.userId, blocks)

  return NextResponse.json({ success: true })
}


