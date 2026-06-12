"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Error boundary de segment : capture les erreurs des pages sous [locale].
// Composant client obligatoire (props standard Next : { error, reset }).
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale === "en" ? "en" : "fr";

  useEffect(() => {
    // Trace l'erreur côté client pour le diagnostic.
    console.error(error);
  }, [error]);

  return (
    <div className="container grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-6xl text-gradient">Oops</p>
        <h1 className="mt-4 font-serif text-2xl font-medium sm:text-3xl">
          {locale === "fr"
            ? "Une erreur est survenue"
            : "Something went wrong"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {locale === "fr"
            ? "Désolé, un problème est survenu de notre côté. Vous pouvez réessayer."
            : "Sorry, something went wrong on our side. You can try again."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()}>
            {locale === "fr" ? "Réessayer" : "Try again"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              {locale === "fr" ? "Retour à l’accueil" : "Back home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
