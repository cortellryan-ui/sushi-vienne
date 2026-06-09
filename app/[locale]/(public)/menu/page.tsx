import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMenu } from "@/lib/data/menu";
import { MenuClient } from "@/components/menu/MenuClient";

export default async function MenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("menu");
  const menu = await getMenu();

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
