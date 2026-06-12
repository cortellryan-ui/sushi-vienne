import { Reveal } from "@/components/site/Reveal";

/**
 * Effet « Lamp » (adapté d'Aceternity / 21st.dev) — reproduit en CSS pur
 * (sans framer-motion), aux couleurs de la marque (orange) sur fond noir.
 * Un faisceau de lumière éclaire le titre, qui apparaît en surimpression.
 */
export function LampTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative isolate z-0 flex min-h-[68vh] w-full flex-col items-center justify-center overflow-hidden bg-ink">
      <div className="relative isolate z-0 flex w-full flex-1 scale-y-125 items-center justify-center animate-lamp-on">
        {/* Faisceau gauche */}
        <div className="absolute inset-auto right-1/2 h-56 w-[30rem] origin-right overflow-visible bg-gradient-conic from-brand via-transparent to-transparent text-white animate-lamp-beam [--conic-position:from_70deg_at_center_top]">
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-ink [mask-image:linear-gradient(to_right,white,transparent)]" />
        </div>
        {/* Faisceau droit */}
        <div className="absolute inset-auto left-1/2 h-56 w-[30rem] origin-left bg-gradient-conic from-transparent via-transparent to-brand text-white animate-lamp-beam [--conic-position:from_290deg_at_center_top]">
          <div className="absolute bottom-0 right-0 z-20 h-full w-40 bg-ink [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
        </div>

        {/* Lueurs */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-ink blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-brand opacity-50 blur-3xl" />
        <div className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-brand blur-2xl" />
        {/* Trait lumineux */}
        <div className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-brand" />
        {/* Masque haut */}
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-ink" />
      </div>

      <div className="relative z-50 flex -translate-y-[18rem] flex-col items-center px-5 text-center">
        <Reveal>
          <h1 className="bg-gradient-to-br from-white to-white/60 bg-clip-text py-2 font-display text-4xl tracking-tight text-transparent sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-xl text-white/55">{subtitle}</p>
          )}
        </Reveal>
      </div>
    </div>
  );
}
