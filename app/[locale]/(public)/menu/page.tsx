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
    <div className="bg-gradient-to-b from-[#FFF1E8] via-cream to-white">
      <header className="container pt-12 pb-2 text-center md:pt-16">
        <h1 className="font-serif font-medium text-4xl sm:text-5xl">{t("title")}</h1>
      </header>

      <MenuClient menu={menu} />
    </div>
  );
}
