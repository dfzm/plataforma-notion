import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SESSION_COOKIE = "noion_user"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.user) {
    return NextResponse.json({ error: "Información de usuario requerida" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const value = Buffer.from(JSON.stringify(body.user)).toString("base64url")

  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}


