import { NextResponse } from "next/server"

import { deletePage, getPageById, updatePageTitle } from "@/lib/storage/pages"

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const page = await getPageById(id)

  if (!page) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ page })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body?.title) {
    return NextResponse.json({ error: "Título requerido" }, { status: 400 })
  }

  const page = await updatePageTitle(id, body.title)

  if (!page) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ page })
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  await deletePage(id)
  return NextResponse.json({ success: true })
}


