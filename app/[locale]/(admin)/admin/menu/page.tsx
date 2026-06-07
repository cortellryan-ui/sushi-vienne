import { setRequestLocale } from "next-intl/server";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";

export default function AdminMenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <AdminMenuManager />;
}
