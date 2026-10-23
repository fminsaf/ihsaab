import { useEffect, useRef, useState } from "react"
import supabase from "../../lib/supabase"
import { toast } from "../ui/toast"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense" | "transfer"
type EntryAction = "sale" | "customer_payment" | "purchase" | "stock_purchase" | "asset_purchase" | "expense" | "transfer"
type PaymentMethod = "cash" | "bank_transfer"

interface Account {
  id: string
  name: string
  type?: string
  category?: string
  code?: string
}

interface ContactOption {
  id: string
  name: string
}

interface InventoryProduct {
  id: string
  name: string
  sku: string | null
  unit: string
  quantity_on_hand: number
  sale_price: number
  purchase_cost: number
}
interface InventoryLine { product_id: string; quantity: string }

interface FormState {
  action: EntryAction | ""
  type: TransactionType | ""
  amount: string
  date: string
  description: string
  contact_id: string
  payment_status: "paid" | "unpaid"
  // income-specific
  customer: string
  invoice_number: string
  payment_method: PaymentMethod | ""
  // expense-specific
  vendor: string
  category: string
  tax_reserved: string
  // transfer + income/expense accounts
  debit_account_id: string
  credit_account_id: string
  payment_account_id: string
  asset_account_id: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TRANSACTION_TYPES: {
  value: EntryAction
  transactionType: TransactionType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}[] = [
  {
    value: "sale",
    transactionType: "income",
    label: "Sale",
    description: "Record something sold to a customer, paid or still due",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    value: "customer_payment",
    transactionType: "income",
    label: "Customer payment",
    description: "Record money received for a previous sale",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    value: "purchase",
    transactionType: "expense",
    label: "Purchase or bill",
    description: "Record something bought, paid or still due",
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  {
    value: "stock_purchase",
    transactionType: "expense",
    label: "Stock purchase",
    description: "Add products to inventory from a supplier",
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  {
    value: "asset_purchase",
    transactionType: "expense",
    label: "Asset purchase",
    description: "Record equipment, vehicles, or other long-term business assets",
    icon: TrendingDown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    value: "expense",
    transactionType: "expense",
    label: "Other expense",
    description: "Record a business cost that is not a purchase bill",
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  {
    value: "transfer",
    transactionType: "transfer",
    label: "Transfer",
    description: "Move money between accounts",
    icon: ArrowLeftRight,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

const EMPTY_FORM: FormState = {
  action: "",
  type: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  contact_id: "",
  payment_status: "paid",
  customer: "",
  invoice_number: "",
  payment_method: "",
  vendor: "",
  category: "",
  tax_reserved: "",
  debit_account_id: "",
  credit_account_id: "",
  payment_account_id: "",
  asset_account_id: "",
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  /** Called after a successful insert so the parent can refresh its list */
  onSuccess?: () => void
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  businessId,
  onSuccess,
}: NewTransactionDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([])
  const [inventoryLines, setInventoryLines] = useState<InventoryLine[]>([])
  const [addingContact, setAddingContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [saving, setSaving] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  // Contacts are used by income and expense entries.
  useEffect(() => {
    if (!open || !businessId) return
    supabase.from("contacts").select("id, name").eq("business_id", businessId).order("name")
      .then(({ data }) => setContacts(data ?? []))
  }, [open, businessId])

  // Load account options only for transaction types that use ledger accounts.
  useEffect(() => {
    const usesAccounts = ["transfer", "sale", "customer_payment", "purchase", "stock_purchase", "asset_purchase", "expense"].includes(form.action)
    if (!open || !businessId || !usesAccounts) return
    setLoadingAccounts(true)
    setAccounts([])
    supabase
      .from("accounts")
      .select("id, name, category")
      .eq("business_id", businessId)
      .order("name")
      .then(({ data, error }) => {
        setLoadingAccounts(false)
        if (error) {
          toast.add({ description: "Failed to load accounts.", type: "error" })
        } else {
          setAccounts(data ?? [])
        }
      })
  }, [open, businessId, form.action])

  useEffect(() => {
    if (!open || !businessId || (form.action !== "sale" && form.action !== "stock_purchase")) return
    supabase.from("inventory_products")
      .select("id, name, sku, unit, quantity_on_hand, sale_price, purchase_cost")
      .eq("business_id", businessId).eq("is_archived", false).order("name")
      .then(({ data, error }) => {
        if (error) toast.add({ description: "Failed to load inventory.", type: "error" })
        setInventoryProducts(data ?? [])
      })
  }, [open, businessId, form.action])

  // ── Focus amount when type is selected ────────────────────────────────────
  useEffect(() => {
    if (form.type) {
      setTimeout(() => amountRef.current?.focus(), 50)
    }
  }, [form.type])

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTypeSelect(value: EntryAction) {
    const selectedAction = TRANSACTION_TYPES.find((item) => item.value === value)
    // Reset type-specific fields when switching
    setForm((prev) => ({
      ...EMPTY_FORM,
      date: prev.date,
      amount: prev.amount,
      description: prev.description,
      action: value,
      type: selectedAction?.transactionType ?? "",
    }))
    setInventoryLines([])
  }

  function handleClose() {
    if (saving) return
    setForm(EMPTY_FORM)
    setInventoryLines([])
    setAddingContact(false)
    setNewContactName("")
    onOpenChange(false)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    if (!form.type) {
      toast.add({ description: "Please select a transaction type.", type: "error" })
      return false
    }
    const amount = parseFloat(form.amount)
    const usesInventory = form.action === "sale" || form.action === "stock_purchase"
    if (!usesInventory && (!form.amount || isNaN(amount) || amount < 0)) {
      toast.add({ description: "Please enter a valid amount (≥ 0).", type: "error" })
      return false
    }
    if (usesInventory && (inventoryLines.length === 0 || inventoryLines.some((line) => !line.product_id || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0))) {
      toast.add({ description: "Add inventory items with a quantity greater than zero.", type: "error" })
      return false
    }
    if (form.action === "sale" && inventoryLines.some((line) => Number(line.quantity) > Number(inventoryProducts.find((product) => product.id === line.product_id)?.quantity_on_hand ?? 0))) {
      toast.add({ description: "A sale quantity cannot exceed the available stock.", type: "error" })
      return false
    }
    if (!form.date) {
      toast.add({ description: "Please select a date.", type: "error" })
      return false
    }
    if ((form.action === "sale" || form.action === "customer_payment") && !form.contact_id && !newContactName.trim()) {
      toast.add({ description: "Choose a customer or add a new one.", type: "error" })
      return false
    }
    if ((form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase") && !form.contact_id && !newContactName.trim()) {
      toast.add({ description: "Choose a vendor or add a new one.", type: "error" })
      return false
    }
    if (form.action === "asset_purchase" && !form.asset_account_id) {
      toast.add({ description: "Choose the asset ledger for this purchase.", type: "error" })
      return false
    }
    const paymentCanUseBank = form.action === "customer_payment" || form.action === "expense" || form.payment_status === "paid"
    if (form.action !== "transfer" && paymentCanUseBank && form.payment_method === "bank_transfer" && !form.payment_account_id) {
      toast.add({ description: "Choose the bank ledger used for this transaction.", type: "error" })
      return false
    }
    if (form.type === "transfer" && (!form.debit_account_id || !form.credit_account_id)) {
      toast.add({ description: "Choose the accounts the money moves between.", type: "error" })
      return false
    }
    if (form.type === "transfer" && form.debit_account_id === form.credit_account_id) {
      toast.add({ description: "Debit and credit accounts must be different for a transfer.", type: "error" })
      return false
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast.add({ description: "You must be signed in to record a transaction.", type: "error" })
      setSaving(false)
      return
    }

    let contactId = form.contact_id || null
    if (addingContact && newContactName.trim()) {
      const { data: contact, error: contactError } = await supabase
        .from("contacts")
        .insert({ business_id: businessId, name: newContactName.trim() })
        .select("id")
        .single()
      if (contactError || !contact) {
        toast.add({ description: contactError?.message ?? "Could not create contact.", type: "error" })
        setSaving(false)
        return
      }
      contactId = contact.id
    }

    if (form.action === "sale" || form.action === "stock_purchase") {
      const { error } = await supabase.rpc("create_inventory_transaction", {
        p_business_id: businessId,
        p_action: form.action,
        p_date: form.date,
        p_description: form.description || null,
        p_contact_id: contactId,
        p_payment_status: form.payment_status,
        p_payment_method: form.payment_status === "paid" ? form.payment_method || null : null,
        p_tax_reserved: form.action === "stock_purchase" && form.tax_reserved ? Number(form.tax_reserved) : null,
        p_category: form.action === "stock_purchase" ? form.category || null : form.invoice_number || null,
        p_items: inventoryLines.map((line) => ({ product_id: line.product_id, quantity: Number(line.quantity) })),
        p_debit_account_id: form.action === "sale" && form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_account_id || null : null,
        p_credit_account_id: form.action === "stock_purchase" && form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_account_id || null : null,
      })
      setSaving(false)
      if (error) {
        toast.add({ description: error.message, type: "error" })
        return
      }
      toast.add({ description: "Inventory transaction created.", type: "success" })
      if (contactId && addingContact) setContacts((current) => [...current, { id: contactId!, name: newContactName.trim() }])
      setForm(EMPTY_FORM)
      setInventoryLines([])
      setAddingContact(false)
      setNewContactName("")
      onOpenChange(false)
      onSuccess?.()
      return
    }

    // Build type-specific payload — only include relevant columns
    const basePayload = {
      business_id: businessId,
      contact_id: contactId,
      date: form.date,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description || null,
      debit_account_id: form.action === "transfer" ? form.debit_account_id || null
        : form.action === "asset_purchase" ? form.asset_account_id || null
        : form.action === "customer_payment" && form.payment_method === "bank_transfer" ? form.payment_account_id || null
        : null,
      credit_account_id: form.action === "transfer" ? form.credit_account_id || null
        : form.type === "expense" && form.payment_method === "bank_transfer" && form.payment_status === "paid" ? form.payment_account_id || null
        : null,
    }

    let typePayload: Record<string, unknown> = {}

    if (form.action === "customer_payment") {
      typePayload = { category: `Customer payment${form.payment_method ? ` · ${form.payment_method}` : ""}`, tax_reserved: null }
    } else if (form.action === "purchase") {
      typePayload = {
        category: ["Purchase", form.payment_status === "paid" ? "Paid" : "Unpaid", form.category.trim(), form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_method : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.action === "asset_purchase") {
      typePayload = {
        category: ["Asset purchase", form.payment_status === "paid" ? "Paid" : "Unpaid", form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_method : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.type === "income") {
      typePayload = {
        category: form.customer
          ? `Customer: ${form.customer}`
          : form.invoice_number
          ? `Invoice: ${form.invoice_number}`
          : form.category || null,
        tax_reserved: null,
      }
    } else if (form.type === "expense") {
      typePayload = {
        category: form.category || "Other Expense",
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else {
      typePayload = {
        category: null,
        tax_reserved: null,
      }
    }

    const { error } = await supabase.from("transactions").insert({
      ...basePayload,
      ...typePayload,
    })

    setSaving(false)

    if (error) {
      toast.add({ description: error.message, type: "error" })
      return
    }

    toast.add({ description: "Transaction created.", type: "success" })
    if (contactId && addingContact) {
      setContacts((current) => [...current, { id: contactId!, name: newContactName.trim() }])
    }
    setForm(EMPTY_FORM)
    setAddingContact(false)
    setNewContactName("")
    onOpenChange(false)
    onSuccess?.()
  }

  // ── Account option helpers ────────────────────────────────────────────────
  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: a.code ? `${a.code} · ${a.name}` : a.name,
    type: a.type,
  }))

  function AccountSelect({
    id,
    value,
    onChange,
    placeholder,
    excludeId,
  }: {
    id: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    excludeId?: string
  }) {
    const options = excludeId
      ? accountOptions.filter((a) => a.value !== excludeId)
      : accountOptions

    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={loadingAccounts ? "Loading accounts…" : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && !loadingAccounts ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No accounts found
            </div>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    )
  }

  function BankLedgerField({ id }: { id: string }) {
    if (form.payment_method !== "bank_transfer") return null
    const bankAccounts = accounts.filter((account) => {
      if (account.category?.toLowerCase() !== "asset") return false
      const normalized = account.name.toLowerCase()
      return /bank|checking|savings|current account/.test(normalized) || !/cash on hand|receivable|customer dues|inventory/.test(normalized)
    })
    return <div className="space-y-1.5"><Label htmlFor={id}>Bank ledger</Label><Select value={form.payment_account_id} onValueChange={(value) => setField("payment_account_id", value)}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Choose bank account" /></SelectTrigger><SelectContent>{bankAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select>{bankAccounts.length === 0 && <p className="text-xs text-muted-foreground">Create a bank ledger on the Ledgers page first.</p>}</div>
  }

  const selectedTypeMeta = TRANSACTION_TYPES.find((t) => t.value === form.action)
  const isInventoryAction = form.action === "sale" || form.action === "stock_purchase"
  const inventoryTotal = inventoryLines.reduce((total, line) => {
    const product = inventoryProducts.find((item) => item.id === line.product_id)
    if (!product) return total
    const unitPrice = form.action === "sale" ? Number(product.sale_price) : Number(product.purchase_cost)
    return total + Math.round(Number(line.quantity || 0) * unitPrice * 100) / 100
  }, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden p-0"
      >
        {/* ── Fixed header ─────────────────────────────────── */}
        <div className="border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>New transaction</DialogTitle>
            <DialogDescription>Choose what happened and enter the details. You can add accounting accounts later.</DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <form
          id="new-transaction-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-6">

            {/* ── Section 1: Transaction type ─────────────── */}
            <section>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Transaction type
              </p>
              <Select value={form.action} onValueChange={(value) => handleTypeSelect(value as EntryAction)}>
                <SelectTrigger id="transaction-type" className="w-full">
                  <SelectValue placeholder="Choose transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTypeMeta && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedTypeMeta.description}
                </p>
              )}
            </section>

            {/* ── Sections 2 & 3: Only shown after type is selected ── */}
            {form.action && (
              <>
                {/* ── Section 2: Common details ───────────── */}
                <section>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Common Details
                  </p>
                  <div className="space-y-3">

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">
                        Amount <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        ref={amountRef}
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={isInventoryAction ? inventoryTotal.toFixed(2) : form.amount}
                        readOnly={isInventoryAction}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("amount", e.target.value)
                        }
                        required={!isInventoryAction}
                      />
                      {isInventoryAction && <p className="text-xs text-muted-foreground">Calculated from the selected inventory items.</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label htmlFor="date">
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("date", e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        type="text"
                        placeholder="Brief note about this transaction…"
                        value={form.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* ── Section 3: Type-specific details ────── */}
                <section>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {form.action === "sale"
                      ? "Sale details"
                      : form.action === "customer_payment"
                      ? "Payment details"
                      : form.action === "purchase"
                      ? "Purchase details"
                      : form.action === "stock_purchase"
                      ? "Stock purchase details"
                      : form.action === "asset_purchase"
                      ? "Asset purchase details"
                      : form.type === "income"
                      ? "Income details"
                      : form.type === "expense"
                      ? "Expense Details"
                      : "Transfer Details"}
                  </p>

                  <div className="space-y-3">

                    {/* ── INCOME fields ─── */}
                    {(form.action === "sale" || form.action === "customer_payment") && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="contact_id">Customer</Label>
                          <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                            <SelectTrigger id="contact_id" className="w-full">
                              <SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a customer"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {contacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => { setAddingContact((open) => !open); setField("contact_id", "") }}>
                            {addingContact ? "Choose an existing customer" : "+ Create a new customer"}
                          </button>
                          {addingContact && <Input aria-label="New customer name" autoFocus placeholder="New customer name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />}
                          <p className="text-xs text-muted-foreground">The customer name will be saved with this transaction.</p>
                        </div>
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="sale-payment-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="sale-payment-status" className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">Customer owes me</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="invoice_number">Invoice Number</Label>
                          <Input
                            id="invoice_number"
                            type="text"
                            placeholder="e.g. INV-001"
                            value={form.invoice_number}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setField("invoice_number", e.target.value)
                            }
                          />
                        </div>}
                        {((form.action === "sale" && form.payment_status === "paid") || form.action === "customer_payment") && <div className="space-y-1.5">
                          <Label htmlFor="income_payment_method">Payment Method</Label>
                          <Select
                            value={form.payment_method}
                            onValueChange={(v) => setField("payment_method", v as PaymentMethod)}
                          >
                            <SelectTrigger id="income_payment_method" className="w-full">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>}
                        {((form.action === "sale" && form.payment_status === "paid") || form.action === "customer_payment") && <BankLedgerField id="income-bank-ledger" />}
                      </>
                    )}

                    {/* ── EXPENSE fields ─── */}
                    {(form.type === "expense" && (form.action === "expense" || form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase")) && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="vendor-contact">Vendor</Label>
                          <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                            <SelectTrigger id="vendor-contact" className="w-full"><SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a vendor"}</SelectValue></SelectTrigger>
                            <SelectContent>{contacts.map((contact) => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => { setAddingContact((open) => !open); setField("contact_id", "") }}>{addingContact ? "Choose an existing vendor" : "+ Create a new vendor"}</button>
                          {addingContact && <Input aria-label="New vendor name" autoFocus placeholder="New vendor name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />}
                        </div>
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase") && <div className="space-y-1.5">
                          <Label htmlFor="purchase-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="purchase-status" className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">I owe the vendor</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "expense") && <div className="space-y-1.5">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            type="text"
                            placeholder="e.g. Rent, Utilities, Salaries"
                            value={form.category}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setField("category", e.target.value)
                            }
                          />
                        </div>}
                        {form.action === "asset_purchase" && <div className="space-y-1.5"><Label htmlFor="asset-ledger">Asset ledger</Label><Select value={form.asset_account_id} onValueChange={(value) => setField("asset_account_id", value)}><SelectTrigger id="asset-ledger" className="w-full"><SelectValue placeholder="Choose asset account" /></SelectTrigger><SelectContent>{accounts.filter((account) => account.category?.toLowerCase() === "asset").map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select>{accounts.filter((account) => account.category?.toLowerCase() === "asset").length === 0 && <p className="text-xs text-muted-foreground">Add an asset ledger on the Ledgers page first.</p>}</div>}
                        <div className="space-y-1.5">
                          <Label htmlFor="tax_reserved">Tax Amount</Label>
                          <Input
                            id="tax_reserved"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.tax_reserved}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setField("tax_reserved", e.target.value)
                            }
                          />
                        </div>
                        {(form.action !== "purchase" && form.action !== "stock_purchase" && form.action !== "asset_purchase" || form.payment_status === "paid") && <div className="space-y-1.5">
                          <Label htmlFor="expense_payment_method">Payment Method</Label>
                          <Select
                            value={form.payment_method}
                            onValueChange={(v) => setField("payment_method", v as PaymentMethod)}
                          >
                            <SelectTrigger id="expense_payment_method" className="w-full">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>}
                        {(form.action === "expense" || form.payment_status === "paid") && <BankLedgerField id="expense-bank-ledger" />}
                      </>
                    )}

                    {isInventoryAction && <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Inventory items</p><p className="text-xs text-muted-foreground">{form.action === "sale" ? "Sale quantity cannot exceed stock on hand." : "Purchased quantities are added to stock."}</p></div><Button type="button" variant="outline" size="sm" onClick={() => setInventoryLines((current) => [...current, { product_id: "", quantity: "1" }])}>Add item</Button></div>
                      {inventoryProducts.length === 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">No active inventory products found. Add products on the Inventory page first.</p>}
                      {inventoryLines.length === 0 && inventoryProducts.length > 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">Add an item to this transaction.</p>}
                      {inventoryLines.map((line, index) => {
                        const selected = inventoryProducts.find((product) => product.id === line.product_id)
                        const unitPrice = selected ? Number(form.action === "sale" ? selected.sale_price : selected.purchase_cost) : 0
                        const usedElsewhere = new Set(inventoryLines.filter((_, lineIndex) => lineIndex !== index).map((item) => item.product_id))
                        return <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2">
                          <div className="min-w-0 space-y-1.5"><Label htmlFor={`inventory-product-${index}`}>Product</Label><Select value={line.product_id} onValueChange={(value) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, product_id: value } : item))}><SelectTrigger id={`inventory-product-${index}`} className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{inventoryProducts.filter((product) => !usedElsewhere.has(product.id)).map((product) => <SelectItem key={product.id} value={product.id}>{product.name}{product.sku ? ` · ${product.sku}` : ""}{form.action === "sale" ? ` · ${Number(product.quantity_on_hand)} ${product.unit} available` : ""}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{selected ? `${unitPrice.toFixed(2)} per ${selected.unit}` : "Choose an item"}</p></div>
                          <div className="space-y-1.5"><Label htmlFor={`inventory-quantity-${index}`}>Qty</Label><Input id={`inventory-quantity-${index}`} type="number" min="0.001" step="0.001" max={form.action === "sale" && selected ? selected.quantity_on_hand : undefined} required value={line.quantity} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, quantity: event.target.value } : item))} /></div>
                          <Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={() => setInventoryLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}>×</Button>
                        </div>
                      })}
                    </div>}

                    {/* ── DOUBLE-ENTRY ACCOUNTS (all types) ─── */}
                    {form.type === "transfer" && <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">Transfer accounts</p>

                      <div className="space-y-1.5">
                        <Label htmlFor="debit_account_id">
                          Debit Account <span className="text-destructive">*</span>
                        </Label>
                        <AccountSelect
                          id="debit_account_id"
                          value={form.debit_account_id}
                          onChange={(v) => setField("debit_account_id", v)}
                          placeholder="Select debit account"
                          excludeId={
                            form.type === "transfer" ? form.credit_account_id : undefined
                          }
                        />
                        <p className="text-[11px] text-muted-foreground">Account receiving the transferred funds.</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="credit_account_id">
                          Credit Account <span className="text-destructive">*</span>
                        </Label>
                        <AccountSelect
                          id="credit_account_id"
                          value={form.credit_account_id}
                          onChange={(v) => setField("credit_account_id", v)}
                          placeholder="Select credit account"
                          excludeId={
                            form.type === "transfer" ? form.debit_account_id : undefined
                          }
                        />
                        <p className="text-[11px] text-muted-foreground">Account the funds are coming from.</p>
                      </div>
                    </div>}

                  </div>
                </section>
              </>
            )}
          </div>
        </form>

        {/* ── Fixed footer ──────────────────────────────────── */}
        <div className="border-t border-border px-6 py-4">
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-transaction-form"
              disabled={!form.type || saving}
            >
              {saving ? "Saving…" : "Save transaction"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

