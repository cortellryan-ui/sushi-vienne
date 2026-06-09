"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import {
  generatePickupSlots,
  WEEKDAY_KEYS,
  type PickupSlot,
} from "@/lib/pickup-slots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Step = "cart" | "checkout" | "confirmation";

export function CartSheet() {
  const { isOpen, open, close, items, count, total, inc, dec, clear } =
    useCart();
  const tCart = useTranslations("cart");
  const tCheckout = useTranslations("checkout");
  const tConfirm = useTranslations("confirmation");
  const tDays = useTranslations("days");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [order, setOrder] = useState<{ number: number; pickup: string } | null>(
    null,
  );

  // Créneaux valides — calculés côté client (dépend de l'heure courante).
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  useEffect(() => {
    if (isOpen) setSlots(generatePickupSlots());
  }, [isOpen]);

  // Réinitialise l'étape à la fermeture.
  useEffect(() => {
    if (!isOpen) {
      const id = setTimeout(() => {
        setStep("cart");
        setError(false);
      }, 300);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  function slotLabel(s: PickupSlot) {
    const day =
      s.daysFromNow === 0
        ? tCheckout("today")
        : s.daysFromNow === 1
          ? tCheckout("tomorrow")
          : tDays(WEEKDAY_KEYS[s.weekday]);
    return `${day} · ${s.time}`;
  }

  async function submit() {
    setServerError(false);
    if (!name.trim() || !phone.trim() || !pickup) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);

    const chosen = slots.find((s) => s.value === pickup);
    const result = await createOrder({
      customerName: name,
      customerPhone: phone,
      pickupTime: pickup, // ISO (slot.value)
      notes: notes.trim() || null,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    setSubmitting(false);

    if (!result.ok) {
      setServerError(true);
      return;
    }

    setOrder({
      number: result.orderNumber,
      pickup: chosen ? slotLabel(chosen) : "",
    });
    clear();
    setName("");
    setPhone("");
    setPickup("");
    setNotes("");
    setStep("confirmation");
  }

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
      <SheetContent side="right" className="w-full">
        {/* ---------- ÉTAPE PANIER ---------- */}
        {step === "cart" && (
          <>
            <SheetHeader>
              <SheetTitle>{tCart("title")}</SheetTitle>
              <SheetDescription>{tCart("items", { count })}</SheetDescription>
            </SheetHeader>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                <ShoppingBag className="size-10 opacity-40" />
                <p>{tCart("empty")}</p>
                <Button variant="outline" onClick={close}>
                  {tCart("emptyCta")}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 rounded-xl border bg-white p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.unitPrice, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full border bg-cream p-0.5">
                        <button
                          type="button"
                          onClick={() => dec(item.productId)}
                          className="grid size-7 place-items-center rounded-full hover:bg-white"
                          aria-label="-"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="size-3.5 text-red-600" />
                          ) : (
                            <Minus className="size-3.5" />
                          )}
                        </button>
                        <span className="w-5 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => inc(item.productId)}
                          className="grid size-7 place-items-center rounded-full hover:bg-white"
                          aria-label="+"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="w-16 text-right font-semibold tabular-nums">
                        {formatPrice(item.unitPrice * item.quantity, locale)}
                      </span>
                    </div>
                  ))}
                </div>

                <SheetFooter>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {tCart("total")}
                    </span>
                    <span className="font-display text-2xl">
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setStep("checkout")}
                  >
                    {tCart("checkout")}
                  </Button>
                </SheetFooter>
              </>
            )}
          </>
        )}

        {/* ---------- ÉTAPE CHECKOUT ---------- */}
        {step === "checkout" && (
          <>
            <SheetHeader>
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> {tCheckout("back")}
              </button>
              <SheetTitle>{tCheckout("title")}</SheetTitle>
              <SheetDescription>{tCheckout("summary")}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-5">
              <div className="space-y-1.5">
                <Label htmlFor="co-name">{tCheckout("name")}</Label>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tCheckout("namePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-phone">{tCheckout("phone")}</Label>
                <Input
                  id="co-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={tCheckout("phonePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-pickup">{tCheckout("pickup")}</Label>
                {slots.length === 0 ? (
                  <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {tCheckout("noSlots")}
                  </p>
                ) : (
                  <select
                    id="co-pickup"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="" disabled>
                      {tCheckout("pickupPlaceholder")}
                    </option>
                    {slots.map((s) => (
                      <option key={s.value} value={s.value}>
                        {slotLabel(s)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-notes">{tCheckout("notes")}</Label>
                <Textarea
                  id="co-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tCheckout("notesPlaceholder")}
                />
              </div>

              {/* Récapitulatif */}
              <div className="rounded-xl border bg-white p-4">
                <p className="mb-2 text-sm font-semibold">
                  {tCheckout("summary")}
                </p>
                <ul className="space-y-1 text-sm">
                  {items.map((i) => (
                    <li
                      key={i.productId}
                      className="flex justify-between gap-2 text-muted-foreground"
                    >
                      <span className="truncate">
                        {i.quantity}× {i.name}
                      </span>
                      <span className="tabular-nums">
                        {formatPrice(i.unitPrice * i.quantity, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-600">
                  {tCheckout("required")}
                </p>
              )}
              {serverError && (
                <p className="text-sm font-medium text-red-600">
                  {tCheckout("serverError")}
                </p>
              )}
            </div>

            <SheetFooter>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground">{tCart("total")}</span>
                <span className="font-display text-2xl">
                  {formatPrice(total, locale)}
                </span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? tCheckout("sending") : tCheckout("confirm")}
              </Button>
            </SheetFooter>
          </>
        )}

        {/* ---------- ÉTAPE CONFIRMATION ---------- */}
        {step === "confirmation" && order && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <CheckCircle2 className="size-16 text-emerald-500" />
            <h2 className="font-display text-2xl">{tConfirm("title")}</h2>
            <p className="rounded-full bg-ink px-4 py-1.5 font-display text-lg text-white">
              {tConfirm("orderNumber", { number: order.number })}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {tConfirm("message")}
            </p>
            {order.pickup && (
              <p className="text-sm font-medium">
                {tConfirm("pickup")} : {order.pickup}
              </p>
            )}
            <p className="text-xs text-amber-700">{tConfirm("demoNote")}</p>
            <Button className="mt-2" onClick={close}>
              {tConfirm("done")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
