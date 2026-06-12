"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Filet de dernier recours : capture les erreurs du layout racine lui-même.
// Doit rendre son propre <html>/<body> car il remplace tout le document.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr" className={inter.variable}>
      <body className="grid min-h-dvh place-items-center bg-ink font-sans text-white">
        <div className="text-center">
          <p className="font-display text-6xl text-gradient">Oops</p>
          <p className="mt-4 text-white/60">
            Une erreur est survenue. Veuillez réessayer.
          </p>
          <button
            onClick={() => reset()}
            className="mt-8 inline-block rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
