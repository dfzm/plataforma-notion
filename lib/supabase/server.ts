import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { createMockSupabaseClient, resolveSupabaseCredentials } from "./mock"

export async function createClient() {
  const credentials = resolveSupabaseCredentials()

  if (!credentials) {
    return createMockSupabaseClient()
  }

  const cookieStore = await cookies()

  return createServerClient(credentials.url, credentials.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
