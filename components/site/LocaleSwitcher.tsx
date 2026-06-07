"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Bascule FR / EN en conservant la page courante. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/20 p-0.5 text-xs font-semibold",
        isPending && "opacity-60",
        className,
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            l === locale
              ? "bg-brand-gradient text-white"
              : "text-white/70 hover:text-white",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
