import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/supabase/auth";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";

export default async function AdminMenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  await requireUser();
  return <AdminMenuManager />;
}
