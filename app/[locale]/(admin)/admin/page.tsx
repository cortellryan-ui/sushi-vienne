import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

/** Page de connexion admin (Supabase Auth). */
export default async function AdminLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  // Déjà connecté → directement au dashboard.
  if (await getCurrentUser()) redirect("/admin/commandes");

  return (
    <div className="grid place-items-center px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-2xl">
            🍣
          </span>
          <h1 className="font-display text-2xl">Espace restaurant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour gérer les commandes et le menu.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
