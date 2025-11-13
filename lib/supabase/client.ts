import { createBrowserClient } from "@supabase/ssr"

import { createMockSupabaseClient, resolveSupabaseCredentials } from "./mock"

export function createClient() {
  const credentials = resolveSupabaseCredentials()

  if (!credentials) {
    return createMockSupabaseClient()
  }

  return createBrowserClient(credentials.url, credentials.key)
}
