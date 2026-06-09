import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenStatusBadge } from "@/components/site/OpenStatusBadge";
import { OpeningHoursTable } from "@/components/site/OpeningHoursTable";
import { ContactForm } from "@/components/site/ContactForm";
import { RESTAURANT } from "@/lib/restaurant";

export default function InfosPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("infos");

  return (
    <div className="container py-16">
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Colonne infos */}
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <Clock className="size-5 text-brand" /> {t("hoursTitle")}
            </h2>
            <OpenStatusBadge className="mb-4 bg-ink/5 !text-foreground" />
            <OpeningHoursTable />
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
              <MapPin className="size-5 text-brand" /> {t("addressTitle")}
            </h2>
            <p className="text-sm">{RESTAURANT.address.full}</p>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
              <Phone className="size-5 text-brand" /> {t("phoneTitle")}
            </h2>
            <a
              href={`tel:${RESTAURANT.phone.tel}`}
              className="text-lg font-semibold text-brand hover:underline"
            >
              {RESTAURANT.phone.display}
            </a>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <a
                  href={RESTAURANT.uberEatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Uber Eats <ExternalLink />
                </a>
              </Button>
            </div>
          </section>
        </div>

        {/* Colonne carte + contact */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <iframe
              title="Google Maps — Sushi Smile"
              src={RESTAURANT.mapsEmbedSrc}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Formulaire de contact (Resend) */}
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-3 font-display text-xl">{t("contactTitle")}</h2>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
