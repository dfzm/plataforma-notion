// Script to create a demo user using Supabase Admin API
// This bypasses email verification

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createDemoUser() {
  console.log("Creating demo user...")

  // Create user with admin API (bypasses email verification)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "demo@notion.com",
    password: "Demo123456!",
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      display_name: "Demo User",
    },
  })

  if (authError) {
    console.error("Error creating user:", authError.message)
    return
  }

  console.log("✓ Demo user created:", authData.user.email)
  console.log("✓ User ID:", authData.user.id)

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: "demo@notion.com",
    display_name: "Demo User",
  })

  if (profileError) {
    console.error("Error creating profile:", profileError.message)
    return
  }

  console.log("✓ Profile created")
  console.log("\nDemo account ready!")
  console.log("Email: demo@notion.com")
  console.log("Password: Demo123456!")
}

createDemoUser()
