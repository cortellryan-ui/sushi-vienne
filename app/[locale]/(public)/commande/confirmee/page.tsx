import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations("onlinePayment");
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
          <h1 className="mt-4 font-serif font-medium text-3xl">{t("authorized")}</h1>
          <p className="mt-3 inline-block rounded-full bg-ink px-4 py-1.5 font-display text-lg text-white">
            {t("orderNumber", { number: result.orderNumber })}
          </p>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            {t("authorizedMessage")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/menu">{t("backToMenu")}</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-md">
          <XCircle className="mx-auto size-16 text-red-500" />
          <h1 className="mt-4 font-serif font-medium text-3xl">{t("notConfirmed")}</h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            {t("notConfirmedMessage")}
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/menu">{t("backToMenu")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
