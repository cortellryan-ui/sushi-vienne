import { redirect } from "next/navigation";
import { createClient } from "./server";

/** Utilisateur courant (ou null) — pour Server Components / Actions. */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Exige une session ; redirige vers la page de connexion admin sinon. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin");
  return user;
}
