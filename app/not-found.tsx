import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Fallback global (requêtes sans locale valide). Rend son propre <html>
// car il s'affiche hors du layout [locale].
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="grid min-h-dvh place-items-center bg-ink font-sans text-white">
        <div className="text-center">
          <p className="font-display text-6xl text-gradient">404</p>
          <p className="mt-4 text-white/60">Page introuvable / Page not found</p>
          <a
            href="/"
            className="mt-8 inline-block rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold"
          >
            Accueil / Home
          </a>
        </div>
      </body>
    </html>
  );
}
