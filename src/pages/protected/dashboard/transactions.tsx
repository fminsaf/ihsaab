import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { toast } from "../../../components/ui/toast"
import { NewTransactionDialog } from "../../../components/transactions/NewTransactionDialog"
import { LEDGER_BY_CODE } from "../../../lib/ledgerAccounts"
import { fetchAllRows } from "../../../lib/fetchAllRows"
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  CalendarDays,
  ChevronDown,
  UserRound,
  ReceiptText,
  Pencil,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  category: string | null
  created_at: string
  date?: string | null
  contact_id?: string | null
  tax_reserved?: number | null
  ledger_lines?: { account_code: string; debit: number; credit: number; description?: string | null }[] | null
  correction_of?: string | null
  correction_role?: "reversal" | "replacement" | null
}
interface TransactionItem { id: string; transaction_id: string; product_id: string; item_name: string; sku_snapshot: string | null; unit_snapshot: string; quantity: number; unit_price: number; line_total: number; stock_delta: number }
interface InventoryProduct { id: string; name: string; sku: string | null; unit: string; quantity_on_hand: number; sale_price: number; purchase_cost: number; is_archived: boolean }
interface EditItem { product_id: string; quantity: string }

interface OutletCtx {
  bid: string
  currentBusinessName: string
  setNewEntryOpen: (v: boolean) => void
}

const TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  income: {
    label: "Income",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  expense: {
    label: "Expense",
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  transfer: {
    label: "Transfer",
    icon: RefreshCw,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { bid, setNewEntryOpen } = useOutletContext<OutletCtx>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [contactNames, setContactNames] = useState<Record<string, string>>({})
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([])
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([])
  const [editItems, setEditItems] = useState<EditItem[]>([])
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState({ amount: "", date: "", description: "", category: "", contact_id: "", tax_reserved: "" })
  const [savingCorrection, setSavingCorrection] = useState(false)
  const [loadError, setLoadError] = useState("")

  const fetchTransactions = useCallback(async () => {
    if (!bid) return
    setLoading(true)
    const [txResult, contactsResult, inventoryResult] = await Promise.all([
      fetchAllRows((from, to) => supabase.from("transactions").select("id, type, amount, description, category, created_at, date, contact_id, tax_reserved, correction_of, correction_role, ledger_lines").eq("business_id", bid).order("created_at", { ascending: false }).range(from, to)),
      supabase.from("contacts").select("id, name").eq("business_id", bid),
      supabase.from("inventory_products").select("id, name, sku, unit, quantity_on_hand, sale_price, purchase_cost, is_archived").eq("business_id", bid),
    ])
    const transactionIds = (txResult.data ?? []).map((transaction) => transaction.id)
    const itemResults = await Promise.all(Array.from({ length: Math.ceil(transactionIds.length / 500) }, (_, index) =>
      supabase.from("transaction_items").select("id, transaction_id, product_id, item_name, sku_snapshot, unit_snapshot, quantity, unit_price, line_total, stock_delta").in("transaction_id", transactionIds.slice(index * 500, index * 500 + 500))))
    const itemError = itemResults.find((result) => result.error)?.error
    setTransactions(txResult.data ?? [])
    setTransactionItems(itemResults.flatMap((result) => result.data ?? []) as TransactionItem[])
    setInventoryProducts((inventoryResult.data ?? []) as InventoryProduct[])
    setContactNames(Object.fromEntries((contactsResult.data ?? []).map((contact) => [contact.id, contact.name])))
    setLoadError(txResult.error?.message ?? itemError?.message ?? contactsResult.error?.message ?? inventoryResult.error?.message ?? "")
    setLoading(false)
  }, [bid])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Keep layout's "New Entry" button in sync with the local dialog state
  function openDialog() {
    setDialogOpen(true)
    setNewEntryOpen(true)
  }

  function beginEdit(tx: Transaction) {
    setEditing(tx)
    setEditForm({
      amount: String(tx.amount),
      date: tx.date || tx.created_at.slice(0, 10),
      description: tx.description || "",
      category: tx.category || "",
      contact_id: tx.contact_id || "",
      tax_reserved: tx.tax_reserved == null ? "" : String(tx.tax_reserved),
    })
    setEditItems(transactionItems.filter((item) => item.transaction_id === tx.id).map((item) => ({ product_id: item.product_id, quantity: String(item.quantity) })))
  }

  async function saveCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || savingCorrection) return
    if (editingInventory && (editItems.length === 0 || editItems.some((item) => !item.product_id || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0))) {
      toast.add({ description: "Keep at least one inventory item with a quantity greater than zero.", type: "error" })
      return
    }
    if (editingInventory && !editingStockPurchase && editItems.some((line) => {
      const product = inventoryProducts.find((item) => item.id === line.product_id)
      const previousQuantity = editingItems.filter((old) => old.product_id === line.product_id).reduce((sum, old) => sum + Number(old.quantity), 0)
      return Number(line.quantity) > Number(product?.quantity_on_hand ?? 0) + previousQuantity
    })) {
      toast.add({ description: "A corrected sale quantity cannot exceed available stock.", type: "error" })
      return
    }
    setSavingCorrection(true)
    const { error } = await supabase.rpc("correct_transaction", {
      p_transaction_id: editing.id,
      p_amount: Number(editForm.amount),
      p_date: editForm.date,
      p_description: editForm.description.trim() || null,
      p_category: editForm.category.trim() || null,
      p_contact_id: editForm.contact_id && editForm.contact_id !== "__none__" ? editForm.contact_id : null,
      p_tax_reserved: editForm.tax_reserved ? Number(editForm.tax_reserved) : null,
      p_debit_account_id: null,
      p_credit_account_id: null,
      p_inventory_items: transactionItems.some((item) => item.transaction_id === editing.id)
        ? editItems.map((item) => ({ product_id: item.product_id, quantity: Number(item.quantity) }))
        : null,
    })
    setSavingCorrection(false)
    if (error) {
      toast.add({ description: error.message, type: "error" })
      return
    }
    toast.add({ description: "Transaction corrected. The original is kept in the history.", type: "success" })
    setEditing(null)
    await fetchTransactions()
  }

  const editingItems = editing ? transactionItems.filter((item) => item.transaction_id === editing.id) : []
  const editingInventory = editingItems.length > 0
  const editingStockPurchase = editingItems.some((item) => Number(item.stock_delta) > 0)
  const correctedInventoryTotal = editItems.reduce((total, line) => {
    const product = inventoryProducts.find((item) => item.id === line.product_id)
    if (!product) return total
    const price = editingStockPurchase ? Number(product.purchase_cost) : Number(product.sale_price)
    return total + Math.round(Number(line.quantity || 0) * price * 100) / 100
  }, 0)

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (loadError) return <div className="mx-auto max-w-4xl rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive" role="alert">Could not load transactions: {loadError}<Button className="ml-3" variant="outline" size="sm" onClick={() => void fetchTransactions()}>Retry</Button></div>
  if (transactions.length === 0) {
    return (
      <>
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <ArrowLeftRight className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No transactions yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Record your first sale, expense, or fund transfer using the button below.
            </p>
            <Button className="mt-6 gap-2 rounded-full" onClick={openDialog}>
              <Plus className="size-4" />
              New Entry
            </Button>
          </div>
        </div>

        <NewTransactionDialog
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); setNewEntryOpen(v) }}
          businessId={bid}
          onSuccess={fetchTransactions}
        />
      </>
    )
  }

  // ── Transaction list ──────────────────────────────────────────────────────
  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => {
            const meta = TYPE_META[tx.type] ?? {
              label: tx.type,
              icon: ArrowLeftRight,
              color: "text-foreground",
              bg: "bg-muted",
            }
            const Icon = meta.icon
            const isIncome = tx.type === "income"
            const isExpense = tx.type === "expense"
            const amountPrefix = isIncome ? "+" : isExpense ? "-" : ""
            const amountColor = isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : isExpense
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"

            return (
              <div key={tx.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:border-border/80">
                <button type="button" aria-expanded={expandedId === tx.id} onClick={() => setExpandedId((current) => current === tx.id ? null : tx.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className={["flex size-9 shrink-0 items-center justify-center rounded-xl", meta.bg].join(" ")}><Icon className={["size-4", meta.color].join(" ")} /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{meta.label}</p><p className="truncate text-xs text-muted-foreground">{tx.description ?? tx.category ?? "—"}</p></div>
                  <div className="shrink-0 text-right"><p className={["text-sm font-bold", amountColor].join(" ")}>{amountPrefix}{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="flex items-center justify-end gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" />{new Date(`${tx.date || tx.created_at.slice(0, 10)}T00:00:00`).toLocaleDateString()}</p></div>
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${expandedId === tx.id ? "rotate-180" : ""}`} />
                </button>
                {expandedId === tx.id && <div className="grid gap-3 border-t border-border bg-muted/20 px-4 py-4 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2"><ReceiptText className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Description</p><p className="font-medium">{tx.description || "No description"}</p></div></div>
                  {transactionItems.some((item) => item.transaction_id === tx.id) && <div className="sm:col-span-2"><p className="mb-2 text-xs text-muted-foreground">Inventory items</p><div className="space-y-1">{transactionItems.filter((item) => item.transaction_id === tx.id).map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span>{item.item_name} · {Number(item.quantity)} {item.unit_snapshot}{item.sku_snapshot ? ` · ${item.sku_snapshot}` : ""}</span><span className="shrink-0 tabular-nums">{Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>)}</div></div>}
                  <div><p className="text-xs text-muted-foreground">Category / status</p><p className="font-medium">{tx.category || "Uncategorized"}</p></div>
                  {tx.contact_id && <div className="flex items-start gap-2"><UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium">{contactNames[tx.contact_id] || "Contact unavailable"}</p></div></div>}
                  {Number(tx.tax_reserved) > 0 && <div><p className="text-xs text-muted-foreground">Tax</p><p className="font-medium">{Number(tx.tax_reserved).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>}
                  {tx.ledger_lines?.length ? <div className="sm:col-span-2"><p className="mb-1 text-xs text-muted-foreground">Automatic ledger posting</p><div className="space-y-1">{tx.ledger_lines.map((line, index) => <p key={`${line.account_code}-${index}`} className="flex justify-between gap-3 font-medium"><span className="truncate">{LEDGER_BY_CODE.get(line.account_code)?.name ?? "Ledger"} · {Number(line.debit) > 0 ? "Debit" : "Credit"}</span><span className="shrink-0 tabular-nums">{Number(Number(line.debit) || Number(line.credit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>)}</div></div> : null}
                  <div><p className="text-xs text-muted-foreground">Recorded</p><p className="font-medium">{new Date(tx.created_at).toLocaleString()}</p></div>
                  {tx.correction_role && <div><p className="text-xs text-muted-foreground">Correction record</p><p className="font-medium capitalize">{tx.correction_role}{tx.correction_of ? ` of ${tx.correction_of.slice(0, 8)}` : ""}</p></div>}
                  <div className="flex items-center justify-end sm:col-span-2"><Button type="button" variant="outline" size="sm" className="gap-2" disabled={tx.correction_role === "reversal" || tx.type === "opening"} onClick={() => beginEdit(tx)}><Pencil className="size-3.5" />{tx.correction_role === "reversal" ? "Reversal entry" : tx.type === "opening" ? "Opening balance (locked)" : "Edit transaction"}</Button></div>
                </div>}
              </div>
            )
          })}
        </div>
      </div>

      <NewTransactionDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); setNewEntryOpen(v) }}
        businessId={bid}
        onSuccess={fetchTransactions}
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open && !savingCorrection) setEditing(null) }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>Saving creates a reversal and a corrected entry. The original transaction stays in your history.</DialogDescription>
          </DialogHeader>
          {editing && <form id="edit-transaction-form" onSubmit={saveCorrection} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="edit-amount">Amount</Label><Input id="edit-amount" type="number" min="0.01" step="0.01" required={!editingInventory} readOnly={editingInventory} value={editingInventory ? correctedInventoryTotal.toFixed(2) : editForm.amount} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, amount: event.target.value })} />{editingInventory && <p className="text-xs text-muted-foreground">Calculated from the corrected item quantities.</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="edit-date">Transaction date</Label><Input id="edit-date" type="date" required value={editForm.date} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, date: event.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="edit-description">Description</Label><Input id="edit-description" value={editForm.description} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: event.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="edit-category">Category and payment status</Label><Input id="edit-category" value={editForm.category} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, category: event.target.value })} /></div>
            {editingInventory && <div className="space-y-3 rounded-xl border border-border p-3 sm:col-span-2"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Inventory items</p><p className="text-xs text-muted-foreground">The correction reverses the old stock movement and applies these quantities.</p></div><Button type="button" size="sm" variant="outline" onClick={() => setEditItems((current) => [...current, { product_id: "", quantity: "1" }])}>Add item</Button></div>{editItems.map((line, index) => {
              const product = inventoryProducts.find((item) => item.id === line.product_id)
              const oldQuantity = editingItems.filter((item) => item.product_id === line.product_id).reduce((sum, item) => sum + Number(item.quantity), 0)
              const available = Number(product?.quantity_on_hand ?? 0) + oldQuantity
              const usedElsewhere = new Set(editItems.filter((_, itemIndex) => itemIndex !== index).map((item) => item.product_id))
              const options = inventoryProducts.filter((item) => !item.is_archived || editingItems.some((old) => old.product_id === item.id))
              return <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2"><div className="space-y-1.5"><Label htmlFor={`edit-item-${index}`}>Product</Label><Select value={line.product_id} onValueChange={(value) => setEditItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, product_id: value } : item))}><SelectTrigger id={`edit-item-${index}`} className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{options.filter((item) => !usedElsewhere.has(item.id)).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.is_archived ? " · Archived" : ""}</SelectItem>)}</SelectContent></Select>{product && <p className="text-xs text-muted-foreground">{editingStockPurchase ? Number(product.purchase_cost).toFixed(2) : Number(product.sale_price).toFixed(2)} / {product.unit}{!editingStockPurchase && ` · ${available} available`}</p>}</div><div className="space-y-1.5"><Label htmlFor={`edit-quantity-${index}`}>Qty</Label><Input id={`edit-quantity-${index}`} type="number" min="0.001" step="0.001" max={!editingStockPurchase && product ? available : undefined} value={line.quantity} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item))} /></div><Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={() => setEditItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</Button></div>
            })}</div>}
            <div className="space-y-1.5"><Label htmlFor="edit-contact">Contact</Label><Select value={editForm.contact_id || "__none__"} onValueChange={(value) => setEditForm({ ...editForm, contact_id: value === "__none__" ? "" : value })}><SelectTrigger id="edit-contact" className="w-full"><SelectValue>{contactNames[editForm.contact_id] || "No contact"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="__none__">No contact</SelectItem>{Object.entries(contactNames).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label htmlFor="edit-tax">Tax amount</Label><Input id="edit-tax" type="number" min="0" step="0.01" value={editForm.tax_reserved} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, tax_reserved: event.target.value })} /></div>
          </form>}
          <DialogFooter><Button type="button" variant="outline" disabled={savingCorrection} onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="edit-transaction-form" disabled={savingCorrection}>{savingCorrection ? "Saving correction…" : "Save corrected transaction"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
