import { redirect } from "next/navigation";
import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function Home() {
  // Create a Supabase client for server components
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookies().set(name, '', options)
        },
      },
    }
  );
  
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
