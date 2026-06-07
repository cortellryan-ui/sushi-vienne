import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sushi Smile — Sushi à emporter à Vienne",
  description:
    "Sushi frais à emporter à Vienne (38200). Commandez en ligne, retrait au comptoir, paiement sur place. Aussi sur Uber Eats.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
