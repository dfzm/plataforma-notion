import { cookies } from "next/headers"

export interface ServerUser {
  id: string
  email: string
  name: string
}

const SESSION_COOKIE = "noion_user"

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies()
  const encoded = cookieStore.get(SESSION_COOKIE)?.value

  if (!encoded) {
    return null
  }

  try {
    const json = Buffer.from(encoded, "base64url").toString("utf-8")
    const user = JSON.parse(json) as ServerUser

    if (user && user.id && user.email) {
      return user
    }

    return null
  } catch {
    return null
  }
}


