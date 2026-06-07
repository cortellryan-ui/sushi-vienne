import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getMockMenu } from "@/lib/mock-data";
import { MenuClient } from "@/components/menu/MenuClient";

export default function MenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("menu");
  const menu = getMockMenu();

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <MenuClient menu={menu} />
    </div>
  );
}
