import { setRequestLocale } from "next-intl/server";
import { LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Page de connexion admin (maquette — pas d'auth réelle). */
export default function AdminLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

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

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="resto@sushivienne.fr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          {/* En maquette, on entre directement dans le dashboard. */}
          <Button asChild className="w-full">
            <Link href="/admin/commandes">
              <LogIn /> Se connecter
            </Link>
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-amber-700">
          Maquette : connexion non fonctionnelle (Supabase Auth à venir).
        </p>
      </div>
    </div>
  );
}
