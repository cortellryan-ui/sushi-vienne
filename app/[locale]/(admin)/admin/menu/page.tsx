import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/supabase/auth";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { getAdminMenu } from "@/lib/data/menu";

// Toujours lire l'état frais du menu (pas de cache statique sur l'admin).
export const dynamic = "force-dynamic";

export default async function AdminMenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  await requireUser();
  const sections = await getAdminMenu();
  return <AdminMenuManager sections={sections} />;
}
