/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RESTAURANT } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Mentions légales — Sushi Smile",
  description: "Mentions légales du site Sushi Smile, Vienne (38200).",
  robots: { index: false },
};

/**
 * Mentions légales (obligation LCEN). Données société renseignées depuis
 * l'Annuaire des Entreprises ; quelques champs restent à confirmer par le client
 * (marqués « à compléter »).
 */
export default function MentionsLegalesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-serif font-medium text-3xl">Mentions légales</h1>

      <div className="prose prose-neutral mt-8 max-w-none [&_h2]:font-display [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
        <h2>Éditeur du site</h2>
        <p>
          Le présent site est édité par la société <strong>MB (SUSHI SMILE)</strong>,
          exploitant le restaurant <strong>Sushi Smile</strong>.
        </p>
        <ul>
          <li>Dénomination sociale : MB (SUSHI SMILE)</li>
          <li>Enseigne : Sushi Smile</li>
          <li>Forme juridique : à compléter (SARL / SAS…)</li>
          <li>Capital social : à compléter</li>
          <li>Siège social : {RESTAURANT.address.full}</li>
          <li>SIREN : 888 979 838</li>
          <li>SIRET (siège) : 888 979 838 00016</li>
          <li>RCS : Vienne 888 979 838</li>
          <li>N° TVA intracommunautaire : à compléter (FR…888979838)</li>
          <li>Code APE : 56.10C — Restauration de type rapide</li>
          <li>
            Téléphone :{" "}
            <a href={`tel:${RESTAURANT.phone.tel}`}>{RESTAURANT.phone.display}</a>
          </li>
          <li>Email : à compléter (adresse de contact du restaurant)</li>
        </ul>

        <h2>Directeur de la publication</h2>
        <p>Le représentant légal de la société MB (SUSHI SMILE) — nom à compléter.</p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave
          #4133, Walnut, CA 91789, États-Unis — vercel.com. La base de données et
          le stockage sont fournis par <strong>Supabase</strong> (Supabase Inc.).
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus du site (textes, photographies, logo, mise en
          page) est protégé par le droit d'auteur. Toute reproduction sans
          autorisation est interdite.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles est décrit dans notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
