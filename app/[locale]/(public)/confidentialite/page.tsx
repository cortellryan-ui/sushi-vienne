/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Sushi Smile",
  description:
    "Politique de confidentialité et traitement des données personnelles (RGPD) — Sushi Smile, Vienne.",
  robots: { index: false },
};

/** Politique de confidentialité (RGPD). */
export default function ConfidentialitePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-serif font-medium text-3xl">
        Politique de confidentialité
      </h1>

      <div className="prose prose-neutral mt-8 max-w-none [&_h2]:font-display [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
        <p>
          La société MB (SUSHI SMILE), exploitant le restaurant Sushi Smile,
          accorde une grande importance à la protection de vos données
          personnelles, conformément au Règlement Général sur la Protection des
          Données (RGPD) et à la loi « Informatique et Libertés ».
        </p>

        <h2>Données collectées</h2>
        <ul>
          <li>
            <strong>Commande</strong> : nom et numéro de téléphone, créneau de
            retrait choisi et éventuelle note. Ces informations sont
            indispensables au traitement de votre commande.
          </li>
          <li>
            <strong>Formulaire de contact</strong> : nom, adresse email et
            message.
          </li>
          <li>
            Aucun cookie publicitaire ni traceur tiers n'est utilisé. Seul un
            stockage technique local (panier) et un cookie de session pour
            l'espace d'administration sont employés.
          </li>
        </ul>

        <h2>Finalités</h2>
        <ul>
          <li>Préparer et gérer les commandes à emporter ;</li>
          <li>Vous recontacter en cas de besoin concernant une commande ;</li>
          <li>Répondre aux demandes envoyées via le formulaire de contact.</li>
        </ul>

        <h2>Base légale</h2>
        <p>
          Exécution de mesures précontractuelles et contractuelles (traitement de
          la commande) et intérêt légitime (réponse aux demandes de contact).
        </p>

        <h2>Destinataires</h2>
        <p>
          Vos données sont destinées au seul restaurant Sushi Smile. Elles sont
          traitées via des prestataires techniques (sous-traitants) :
        </p>
        <ul>
          <li>Supabase — hébergement de la base de données ;</li>
          <li>Resend — envoi des emails de commande et de contact ;</li>
          <li>Vercel — hébergement du site ;</li>
          <li>
            Stripe — traitement du paiement, uniquement en cas de paiement en
            ligne.
          </li>
        </ul>
        <p>Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales.</p>

        <h2>Durée de conservation</h2>
        <p>
          Les données de commande sont conservées le temps nécessaire à leur
          traitement puis archivées conformément aux obligations comptables et
          fiscales (durée à confirmer par le restaurant). Les messages de contact
          sont conservés le temps du traitement de la demande.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de
          limitation et d'opposition au traitement de vos données. Pour les
          exercer, contactez le restaurant par téléphone ou via le formulaire de
          contact. Vous pouvez également introduire une réclamation auprès de la
          CNIL (www.cnil.fr).
        </p>
      </div>
    </div>
  );
}
