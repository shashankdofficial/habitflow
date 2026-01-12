import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "Loaded" : "NOT SET");
console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded" : "NOT SET");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Supabase environment variables are not set!");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.com",
  supabaseAnonKey || "placeholder-key"
);
