import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartSheet } from "@/components/cart/CartSheet";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { OpeningHoursProvider } from "@/components/site/OpeningHoursProvider";
import { RefreshToHome } from "@/components/site/RefreshToHome";
import { getOpeningHours } from "@/lib/data/opening-hours";

/** Habillage des pages publiques : header noir, footer, panier. */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Horaires lus une seule fois (Supabase) et partagés aux composants client.
  const hours = await getOpeningHours();

  return (
    <OpeningHoursProvider hours={hours}>
      <RefreshToHome />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSheet />
      <FloatingCartButton />
    </OpeningHoursProvider>
  );
}
