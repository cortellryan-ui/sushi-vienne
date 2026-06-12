import { setRequestLocale } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  const locale = useLocale();
  setRequestLocale(locale);
  const t = useTranslations("notFound");

  return (
    <div className="container grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-6xl text-gradient">404</p>
        <p className="mt-4 text-lg text-muted-foreground">{t("message")}</p>
        <Button asChild className="mt-8">
          <Link href="/">{t("back")}</Link>
        </Button>
      </div>
    </div>
  );
}
