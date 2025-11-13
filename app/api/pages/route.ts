import { NextResponse } from "next/server"

import { createPage, getPagesByUser } from "@/lib/storage/pages"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
  }

  const pages = await getPagesByUser(userId)
  return NextResponse.json({ pages })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.userId) {
    return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
  }

  const page = await createPage(body.userId, body.title)
  return NextResponse.json({ page }, { status: 201 })
}


