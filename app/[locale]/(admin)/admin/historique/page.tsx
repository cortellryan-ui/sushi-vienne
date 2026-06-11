import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/supabase/auth";
import { getOrdersHistory } from "@/lib/data/admin-orders";
import { OrdersHistory } from "@/components/admin/OrdersHistory";

export const dynamic = "force-dynamic";

export default async function AdminHistoriquePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  await requireUser();
  const orders = await getOrdersHistory();
  return <OrdersHistory orders={orders} />;
}
