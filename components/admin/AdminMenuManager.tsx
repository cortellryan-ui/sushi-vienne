"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { MenuSection } from "@/lib/data/menu";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  moveProduct,
  renameCategory,
  toggleCategoryActive,
  toggleProductAvailable,
  updateProduct,
  uploadProductImage,
  type MenuActionResult,
} from "@/lib/actions/admin-menu";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductDraft = { name: string; description: string; price: string };

export function AdminMenuManager({ sections }: { sections: MenuSection[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");
  // Édition / création de plat : id du plat édité ou catégorie ciblée.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({
    name: "",
    description: "",
    price: "",
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadFor, setUploadFor] = useState<string | null>(null);

  async function run(p: Promise<MenuActionResult>) {
    setBusy(true);
    setError(null);
    const r = await p;
    setBusy(false);
    if (!r.ok) {
      setError(r.error || "L'opération a échoué.");
      return false;
    }
    router.refresh();
    return true;
  }

  function startEdit(p: {
    id: string;
    name: string;
    description: string | null;
    price: number;
  }) {
    setCreatingIn(null);
    setEditingId(p.id);
    setDraft({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
    });
  }

  function startCreate(categoryId: string) {
    setEditingId(null);
    setCreatingIn(categoryId);
    setDraft({ name: "", description: "", price: "" });
  }

  function cancelForm() {
    setEditingId(null);
    setCreatingIn(null);
  }

  async function submitDraft() {
    const price = parseFloat(draft.price.replace(",", "."));
    if (!draft.name.trim() || Number.isNaN(price) || price < 0) {
      setError("Nom et prix valides requis.");
      return;
    }
    const ok = editingId
      ? await run(
          updateProduct(editingId, {
            name: draft.name,
            description: draft.description,
            price,
          }),
        )
      : creatingIn
        ? await run(
            createProduct({
              categoryId: creatingIn,
              name: draft.name,
              description: draft.description,
              price,
            }),
          )
        : false;
    if (ok) cancelForm();
  }

  async function onPhotoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // réinitialise pour autoriser le même fichier ensuite
    if (!file || !uploadFor) return;
    const fd = new FormData();
    fd.append("productId", uploadFor);
    fd.append("file", file);
    setUploadFor(null);
    await run(uploadProductImage(fd));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPhotoPicked}
      />

      <div className="mb-4">
        <h1 className="font-display text-2xl">Gestion du menu</h1>
        <p className="text-sm text-muted-foreground">
          Catégories, plats, prix, disponibilité et photos. Les changements sont
          immédiatement visibles sur la carte publique.
        </p>
      </div>

      {error && (
        <p className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} aria-label="Fermer">
            <X className="size-4" />
          </button>
        </p>
      )}

      {/* Nouvelle catégorie */}
      <div className="mb-6 flex gap-2">
        <Input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nom d'une nouvelle catégorie"
          className="max-w-xs"
        />
        <Button
          size="sm"
          disabled={busy || !newCat.trim()}
          onClick={async () => {
            if (await run(createCategory(newCat))) setNewCat("");
          }}
        >
          <Plus /> Ajouter
        </Button>
      </div>

      <div className="space-y-6">
        {sections.length === 0 && (
          <p className="rounded-2xl border border-dashed bg-white/50 py-10 text-center text-sm text-muted-foreground">
            Aucune catégorie. Créez-en une pour commencer.
          </p>
        )}

        {sections.map(({ category: cat, products }) => (
          <section
            key={cat.id}
            className="overflow-hidden rounded-2xl border bg-white"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-cream px-4 py-3">
              <h2 className="flex items-center gap-2 font-display text-lg">
                {cat.name}
                <span className="text-sm font-normal text-muted-foreground">
                  ({products.length})
                </span>
                {!cat.isActive && <Badge variant="muted">Masquée</Badge>}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    const name = window.prompt(
                      "Renommer la catégorie",
                      cat.name,
                    );
                    if (name && name.trim()) run(renameCategory(cat.id, name));
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    run(toggleCategoryActive(cat.id, !cat.isActive))
                  }
                >
                  {cat.isActive ? "Masquer" : "Afficher"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Supprimer « ${cat.name} » et tous ses plats ? Action irréversible.`,
                      )
                    )
                      run(deleteCategory(cat.id));
                  }}
                >
                  <Trash2 className="text-red-600" />
                </Button>
                <Button size="sm" onClick={() => startCreate(cat.id)}>
                  <Plus /> Plat
                </Button>
              </div>
            </header>

            <ul className="divide-y">
              {products.map((p, idx) => (
                <li key={p.id} className="px-4 py-3">
                  {editingId === p.id ? (
                    <ProductForm
                      draft={draft}
                      setDraft={setDraft}
                      onSubmit={submitDraft}
                      onCancel={cancelForm}
                      busy={busy}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <button
                          disabled={busy || idx === 0}
                          onClick={() => run(moveProduct(p.id, "up"))}
                          className="text-neutral-400 hover:text-foreground disabled:opacity-30"
                          aria-label="Monter"
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          disabled={busy || idx === products.length - 1}
                          onClick={() => run(moveProduct(p.id, "down"))}
                          className="text-neutral-400 hover:text-foreground disabled:opacity-30"
                          aria-label="Descendre"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadFor(p.id);
                          fileInput.current?.click();
                        }}
                        className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-cream to-muted text-muted-foreground"
                        aria-label={`Photo de ${p.name}`}
                      >
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImagePlus className="size-4" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                      <span className="font-display tabular-nums">
                        {formatPrice(p.price, "fr")}
                      </span>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(toggleProductAvailable(p.id, !p.isAvailable))
                        }
                        className={cn(
                          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                          p.isAvailable ? "bg-emerald-500" : "bg-neutral-300",
                        )}
                        aria-pressed={p.isAvailable}
                        aria-label={`Disponibilité de ${p.name}`}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
                            p.isAvailable ? "left-[22px]" : "left-0.5",
                          )}
                        />
                      </button>

                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => startEdit(p)}
                        aria-label="Éditer"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Supprimer « ${p.name} » ?`))
                            run(deleteProduct(p.id));
                        }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="text-red-600" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}

              {creatingIn === cat.id && (
                <li className="px-4 py-3">
                  <ProductForm
                    draft={draft}
                    setDraft={setDraft}
                    onSubmit={submitDraft}
                    onCancel={cancelForm}
                    busy={busy}
                  />
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ProductForm({
  draft,
  setDraft,
  onSubmit,
  onCancel,
  busy,
}: {
  draft: ProductDraft;
  setDraft: (d: ProductDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl bg-cream/60 p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <Label>Nom</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex. Maki Saumon"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Prix (€)</Label>
          <Input
            type="number"
            step="0.10"
            min="0"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            className="w-28"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="6 pièces · riz, saumon frais, nori"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmit} disabled={busy}>
          Enregistrer
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={busy}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
