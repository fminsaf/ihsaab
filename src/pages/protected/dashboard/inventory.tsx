import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { Archive, Boxes, Pencil, Plus, RefreshCw, Search, RotateCcw } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { toast } from "../../../components/ui/toast"
import { useLocale } from "../../../lib/i18n"

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  unit: string
  quantity_on_hand: number
  sale_price: number
  purchase_cost: number
  is_archived: boolean
}
interface ProductForm {
  name: string
  sku: string
  description: string
  unit: string
  initial_stock: string
  sale_price: string
  purchase_cost: string
}
interface Context { bid: string; currentBusinessCurrency?: string }
const UNIT_OPTIONS = ["item", "piece", "kg", "g", "lb", "liter", "ml", "meter", "cm", "box", "pack", "pair", "dozen", "set", "hour", "day"]
const EMPTY_FORM: ProductForm = { name: "", sku: "", description: "", unit: "item", initial_stock: "0", sale_price: "0", purchase_cost: "0" }

export default function InventoryPage() {
  const { bid, currentBusinessCurrency = "SAR" } = useOutletContext<Context>()
  const { t } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!bid) return
    setLoading(true)
    const { data, error: queryError } = await supabase.from("inventory_products")
      .select("id, name, sku, description, unit, quantity_on_hand, sale_price, purchase_cost, is_archived")
      .eq("business_id", bid).order("name")
    setProducts(data ?? [])
    setError(queryError?.message ?? "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => products.filter((product) => product.is_archived === showArchived &&
    `${product.name} ${product.sku ?? ""} ${product.description ?? ""}`.toLowerCase().includes(search.toLowerCase())), [products, search, showArchived])
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

  function startCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function startEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      description: product.description ?? "",
      unit: product.unit,
      initial_stock: String(product.quantity_on_hand),
      sale_price: String(product.sale_price),
      purchase_cost: String(product.purchase_cost),
    })
    setDialogOpen(true)
  }

  async function persist(product: Product | null, isArchived: boolean) {
    setSaving(true)
    const { error: saveError } = await supabase.rpc("save_inventory_product", {
      p_business_id: bid,
      p_product_id: product?.id ?? null,
      p_name: product?.name ?? form.name,
      p_sku: product?.sku ?? form.sku,
      p_description: product?.description ?? form.description,
      p_category: null,
      p_unit: product?.unit ?? form.unit,
      p_initial_stock: product ? null : Number(form.initial_stock),
      p_sale_price: product ? Number(product.sale_price) : Number(form.sale_price),
      p_purchase_cost: product ? Number(product.purchase_cost) : Number(form.purchase_cost),
      p_is_archived: isArchived,
    })
    setSaving(false)
    if (saveError) {
      toast.add({ description: saveError.message, type: "error" })
      return false
    }
    return true
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.unit.trim()) return
    setSaving(true)
    const { error: saveError } = await supabase.rpc("save_inventory_product", {
      p_business_id: bid,
      p_product_id: editing?.id ?? null,
      p_name: form.name,
      p_sku: form.sku || null,
      p_description: form.description || null,
      p_category: null,
      p_unit: form.unit,
      p_initial_stock: editing ? null : Number(form.initial_stock),
      p_sale_price: Number(form.sale_price),
      p_purchase_cost: Number(form.purchase_cost),
      p_is_archived: editing?.is_archived ?? false,
    })
    setSaving(false)
    if (saveError) {
      toast.add({ description: saveError.message, type: "error" })
      return
    }
    toast.add({ description: editing ? "Product updated." : "Product added to inventory.", type: "success" })
    setDialogOpen(false)
    await load()
  }

  async function toggleArchived(product: Product) {
    if (await persist(product, !product.is_archived)) {
      toast.add({ description: product.is_archived ? "Product restored." : "Product archived.", type: "success" })
      await load()
    }
  }

  return <div className="mx-auto max-w-6xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-xl font-bold">{t("inventoryTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("inventorySubtitle")}</p></div>
      <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh inventory" onClick={() => void load()}><RefreshCw className="size-4" /></Button>{!showArchived && <Button className="gap-2" onClick={startCreate}><Plus className="size-4" />{t("addProduct")}</Button>}</div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load inventory: {error}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search inventory" placeholder="Search products" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} className="pl-9" /></div>
      <Button variant="outline" onClick={() => setShowArchived((current) => !current)}>{showArchived ? "Show active products" : "Show archived"}</Button>
    </div>
    {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
      : filtered.length ? <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[720px] table-fixed text-sm">
        <colgroup><col className="w-[34%]" /><col className="w-[17%]" /><col className="w-[17%]" /><col className="w-[20%]" /><col className="w-[12%]" /></colgroup>
        <thead className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground"><tr><th scope="col" className="px-4 py-3 text-left">Product</th><th scope="col" className="px-4 py-3 text-right">In stock</th><th scope="col" className="px-4 py-3 text-right">Sale price</th><th scope="col" className="px-4 py-3 text-right">Purchase cost</th><th scope="col" className="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-border">{filtered.map((product) => <tr key={product.id}>
          <td className="px-4 py-4"><p className="truncate font-semibold" title={product.name}>{product.name}</p><p className="truncate text-xs text-muted-foreground" title={[product.sku, product.description].filter(Boolean).join(" · ")}>{[product.sku, product.description].filter(Boolean).join(" · ") || "No item details"}</p></td>
          <td className="px-4 py-4 text-right font-medium tabular-nums">{Number(product.quantity_on_hand).toLocaleString()} {product.unit}</td>
          <td className="px-4 py-4 text-right tabular-nums">{format(product.sale_price)}</td>
          <td className="px-4 py-4 text-right tabular-nums">{format(product.purchase_cost)}</td>
          <td className="px-4 py-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={product.is_archived ? `Restore ${product.name}` : `Archive ${product.name}`} onClick={() => void toggleArchived(product)}>{product.is_archived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}</Button></div></td>
        </tr>)}</tbody>
      </table></div>
      : <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><Boxes className="mx-auto size-9 text-muted-foreground/50" /><h3 className="mt-3 font-semibold">{showArchived ? "No archived products" : "No products in inventory"}</h3><p className="mt-1 text-sm text-muted-foreground">{showArchived ? "Archived products will appear here." : "Add a product to start tracking stock and recording item sales."}</p>{!showArchived && <Button className="mt-4" onClick={startCreate}>Add your first product</Button>}</div>}

    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open) }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle><DialogDescription>{editing ? "Update product details and prices. Stock changes only through sales and stock purchases." : "Add an item to use in sales and stock purchases."}</DialogDescription></DialogHeader>
        <form id="inventory-product-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="product-name">Name</Label><Input id="product-name" required value={form.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: event.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="product-sku">SKU</Label><Input id="product-sku" value={form.sku} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sku: event.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="product-unit">Unit type</Label><Select value={UNIT_OPTIONS.includes(form.unit) ? form.unit : "custom"} onValueChange={(value) => setForm({ ...form, unit: value === "custom" ? "" : value })}><SelectTrigger id="product-unit"><SelectValue placeholder="Choose a unit" /></SelectTrigger><SelectContent>{UNIT_OPTIONS.map((unit) => <SelectItem key={unit} value={unit}>{unit[0].toUpperCase() + unit.slice(1)}</SelectItem>)}<SelectItem value="custom">Custom unit</SelectItem></SelectContent></Select>{!UNIT_OPTIONS.includes(form.unit) && <Input aria-label="Custom unit type" required placeholder="Enter unit type" value={form.unit} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, unit: event.target.value })} />}</div>
          {!editing && <div className="space-y-1.5"><Label htmlFor="product-opening-stock">Opening stock</Label><Input id="product-opening-stock" type="number" min="0" step="0.001" required value={form.initial_stock} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, initial_stock: event.target.value })} /></div>}
          <div className="space-y-1.5"><Label htmlFor="product-sale-price">Sales price</Label><Input id="product-sale-price" type="number" min="0" step="0.01" required value={form.sale_price} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sale_price: event.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="product-purchase-cost">Purchase cost</Label><Input id="product-purchase-cost" type="number" min="0" step="0.01" required value={form.purchase_cost} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, purchase_cost: event.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="product-description">Description</Label><Input id="product-description" value={form.description} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, description: event.target.value })} /></div>
        </form>
        <DialogFooter><Button variant="outline" type="button" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="inventory-product-form" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add product"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}
