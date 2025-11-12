import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClientSupabase() {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error(
      "[v0] Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project.",
    )
    throw new Error(
      "Supabase environment variables are not configured. Please add them in the Vars section of the v0 sidebar.",
    )
  }

  supabaseClient = createBrowserClient(url, key)

  return supabaseClient
}
