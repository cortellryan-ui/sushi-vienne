"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Handshake } from "lucide-react";
import { sendPartnershipRequest } from "@/lib/actions/partnership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PartnershipForm() {
  const t = useTranslations("infos");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const res = await sendPartnershipRequest({
      name,
      company: company.trim() || null,
      email,
      message,
    });
    setLoading(false);
    if (res.ok) {
      setStatus("ok");
      setName("");
      setCompany("");
      setEmail("");
      setMessage("");
    } else {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {t("partnerSuccess")}
      </p>
    );
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="pt-name">{t("partnerName")}</Label>
        <Input
          id="pt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pt-company">{t("partnerCompany")}</Label>
        <Input
          id="pt-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="pt-email">{t("partnerEmail")}</Label>
        <Input
          id="pt-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="pt-message">{t("partnerMessage")}</Label>
        <Textarea
          id="pt-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("partnerPlaceholder")}
          required
        />
      </div>
      {status === "error" && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">
          {t("partnerError")}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          <Handshake /> {loading ? t("partnerSending") : t("partnerSend")}
        </Button>
      </div>
    </form>
  );
}
