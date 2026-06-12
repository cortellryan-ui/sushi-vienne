import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmOnlineOrder } from "@/lib/stripe/confirm";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ConfirmeePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { session_id?: string };
}) {
  setRequestLocale(locale);
  const sessionId = searchParams.session_id;
  const result = sessionId
    ? await confirmOnlineOrder(sessionId)
    : { ok: false as const };

  return (
    <div className="container grid min-h-[60vh] place-items-center py-16 text-center">
      {result.ok ? (
        <div className="max-w-md">
          <ClearCartOnMount />
          <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
          <h1 className="mt-4 font-serif font-medium text-3xl">Paiement autorisé</h1>
          <p className="mt-3 inline-block rounded-full bg-ink px-4 py-1.5 font-display text-lg text-white">
            Commande n° {result.orderNumber}
          </p>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Votre commande a bien été reçue. Le restaurant doit la valider — vous
            ne serez débité qu’à l’acceptation. Présentez-vous au créneau choisi
            pour le retrait.
          </p>
          <Button asChild className="mt-6">
            <Link href="/menu">Retour à la carte</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-md">
          <XCircle className="mx-auto size-16 text-red-500" />
          <h1 className="mt-4 font-serif font-medium text-3xl">Paiement non confirmé</h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Le paiement n’a pas pu être confirmé. Vous n’avez pas été débité.
            Réessayez ou choisissez « payer sur place ».
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/menu">Retour à la carte</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
