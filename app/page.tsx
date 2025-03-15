import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Home() {
  // Create a Supabase client for server components
  const supabase = createServerComponentClient({ cookies });
  
  // Check for an active session
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect based on authentication status
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // This return is never reached but keeps TypeScript happy
  return null;
}
