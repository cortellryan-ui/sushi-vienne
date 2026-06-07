import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartSheet } from "@/components/cart/CartSheet";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";

/** Habillage des pages publiques : header noir, footer, panier. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSheet />
      <FloatingCartButton />
    </>
  );
}
