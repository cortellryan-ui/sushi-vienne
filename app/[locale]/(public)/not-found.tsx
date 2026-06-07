import { setRequestLocale } from "next-intl/server";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  const locale = useLocale();
  setRequestLocale(locale);

  return (
    <div className="container grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-6xl text-gradient">404</p>
        <p className="mt-4 text-lg text-muted-foreground">
          {locale === "fr"
            ? "Cette page n'existe pas (ou plus)."
            : "This page doesn't exist."}
        </p>
        <Button asChild className="mt-8">
          <Link href="/">{locale === "fr" ? "Retour à l'accueil" : "Back home"}</Link>
        </Button>
      </div>
    </div>
  );
}
