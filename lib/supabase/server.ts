import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
 * Lit/écrit la session via les cookies. Soumis aux règles RLS.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : ignoré (le middleware rafraîchit la session).
          }
        },
      },
    },
  );
}

/**
 * Client "admin" avec la clé service role — contourne la RLS.
 * À n'utiliser QUE côté serveur, jamais exposé au client.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    },
  );
}
