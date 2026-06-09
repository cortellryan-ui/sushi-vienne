import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/supabase/auth";
import { getAdminOrders } from "@/lib/data/admin-orders";
import { AdminOrdersBoard } from "@/components/admin/AdminOrdersBoard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  await requireUser();
  const orders = await getAdminOrders();
  return <AdminOrdersBoard initialOrders={orders} />;
}
