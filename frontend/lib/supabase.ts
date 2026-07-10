import { createClient } from "@/lib/supabase/client";

// Single shared browser client instance. Session is now stored in cookies
// (via @supabase/ssr) instead of only localStorage, so middleware.ts can
// read it on the server for route protection.
export const supabase = createClient();