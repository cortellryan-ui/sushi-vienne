import { setRequestLocale } from "next-intl/server";
import { AdminOrdersBoard } from "@/components/admin/AdminOrdersBoard";

export default function AdminOrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <AdminOrdersBoard />;
}
