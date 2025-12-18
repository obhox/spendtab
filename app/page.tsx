import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Home() {
  // Create a Supabase client for server components
  const cookieStore = await cookies();
  // @ts-ignore - The library expects a Promise but we need to pass the awaited value for it to work synchronously
  const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
  
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
