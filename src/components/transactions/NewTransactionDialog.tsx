import { useEffect, useState } from "react"
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
  Plus,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense" | "transfer"
type EntryAction = "sale" | "customer_payment" | "purchase" | "stock_purchase" | "asset_purchase" | "expense" | "transfer"
type PaymentMethod = "cash" | "bank_transfer"
type TransferDirection = "cash_to_bank" | "bank_to_cash"

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
  average_cost: number
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
  transfer_direction: TransferDirection
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
const EXPENSE_CATEGORIES = ["Advertising & Marketing", "Bank Charges", "Electricity & Utilities", "Insurance Expense", "Internet & Telephone", "Office Supplies", "Rent Expense", "Repairs & Maintenance", "Salaries & Wages", "Taxes & Licenses", "Transport & Travel", "Miscellaneous Expenses"]

const EMPTY_FORM: FormState = {
  action: "sale",
  type: "income",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  contact_id: "",
  payment_status: "paid",
  customer: "",
  invoice_number: "",
  payment_method: "cash",
  vendor: "",
  category: "",
  tax_reserved: "",
  transfer_direction: "cash_to_bank",
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
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([])
  const [inventoryLines, setInventoryLines] = useState<InventoryLine[]>([])
  const [addingContact, setAddingContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [saving, setSaving] = useState(false)

  // Contacts are used by income and expense entries.
  useEffect(() => {
    if (!open || !businessId) return
    supabase.from("contacts").select("id, name").eq("business_id", businessId).order("name")
      .then(({ data }) => setContacts(data ?? []))
  }, [open, businessId])

  useEffect(() => {
    if (!open || !businessId || (form.action !== "sale" && form.action !== "stock_purchase")) return
    supabase.from("inventory_products")
      .select("id, name, sku, unit, quantity_on_hand, sale_price, purchase_cost, average_cost")
      .eq("business_id", businessId).eq("is_archived", false).order("name")
      .then(({ data, error }) => {
        if (error) toast.add({ description: "Failed to load inventory.", type: "error" })
        setInventoryProducts(data ?? [])
      })
  }, [open, businessId, form.action])

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
    if ((form.action === "purchase" || form.action === "expense") && !form.category) {
      toast.add({ description: "Choose an expense category.", type: "error" })
      return false
    }
    const tax = form.tax_reserved === "" ? 0 : Number(form.tax_reserved)
    if (form.action !== "transfer" && form.action !== "customer_payment" && (!Number.isFinite(tax) || tax < 0)) {
      toast.add({ description: "Enter a valid tax amount (0 or more).", type: "error" })
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
        p_tax_reserved: form.tax_reserved ? Number(form.tax_reserved) : 0,
        p_category: form.action === "stock_purchase" ? form.category || null : form.invoice_number || null,
        p_items: inventoryLines.map((line) => ({ product_id: line.product_id, quantity: Number(line.quantity) })),
        p_debit_account_id: null,
        p_credit_account_id: null,
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
        category: [
          form.customer ? `Customer: ${form.customer}` : form.invoice_number ? `Invoice: ${form.invoice_number}` : form.category || "Sale",
          form.payment_status === "paid" ? "Paid" : "Unpaid",
          form.payment_status === "paid" && form.payment_method === "bank_transfer" ? "bank_transfer" : "",
        ].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.type === "expense") {
      typePayload = {
        category: form.category || "Other Expense",
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.action === "transfer") {
      typePayload = {
        category: form.transfer_direction === "cash_to_bank" ? "Transfer · Cash to bank" : "Transfer · Bank to cash",
        tax_reserved: null,
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

  const selectedTypeMeta = TRANSACTION_TYPES.find((t) => t.value === form.action)
  const isInventoryAction = form.action === "sale" || form.action === "stock_purchase"
  const inventoryTotal = inventoryLines.reduce((total, line) => {
    const product = inventoryProducts.find((item) => item.id === line.product_id)
    if (!product) return total
    const unitPrice = form.action === "sale" ? Number(product.sale_price) : Number(product.purchase_cost)
    return total + Math.round(Number(line.quantity || 0) * unitPrice * 100) / 100
  }, 0)
  const previewAmount = isInventoryAction ? inventoryTotal : Number(form.amount || 0)
  const taxAmount = Number(form.tax_reserved || 0)
  const grossAmount = previewAmount + taxAmount
  const paymentLedger = form.payment_method === "bank_transfer" ? "Bank Accounts" : "Cash on Hand"
  const expenseLedger = EXPENSE_CATEGORIES.includes(form.category) ? form.category : "Miscellaneous Expenses"
  const postingPreview: { ledger: string; side: "Debit" | "Credit"; amount: number }[] = []
  const addPosting = (ledger: string, side: "Debit" | "Credit", amount = previewAmount) => {
    postingPreview.push({ ledger, side, amount: Math.max(0, amount) })
  }
  const addTaxPosting = (ledger: string, side: "Debit" | "Credit") => {
    if (taxAmount > 0) addPosting(ledger, side, taxAmount)
  }

  if (form.action === "transfer") {
    const toBank = form.transfer_direction === "cash_to_bank"
    addPosting(toBank ? "Bank Accounts" : "Cash on Hand", "Debit")
    addPosting(toBank ? "Cash on Hand" : "Bank Accounts", "Credit")
  } else if (form.action === "sale") {
    addPosting(form.payment_status === "unpaid" ? "Accounts Receivable (Customer Dues)" : paymentLedger, "Debit", grossAmount)
    addPosting("Sales Revenue", "Credit")
    addTaxPosting("Taxes Payable", "Credit")
    const cost = inventoryLines.reduce((sum, line) => {
      const product = inventoryProducts.find((item) => item.id === line.product_id)
      return sum + Number(line.quantity || 0) * Number(product?.average_cost ?? product?.purchase_cost ?? 0)
    }, 0)
    if (inventoryLines.length > 0) {
      addPosting("Cost of Goods Sold", "Debit", cost)
      addPosting("Inventory", "Credit", cost)
    }
  } else if (form.action === "customer_payment") {
    addPosting(paymentLedger, "Debit")
    addPosting("Accounts Receivable (Customer Dues)", "Credit")
  } else if (form.action === "stock_purchase") {
    addPosting("Inventory", "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  } else if (form.action === "asset_purchase") {
    addPosting("Property, Plant & Equipment", "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  } else if (form.type === "expense") {
    addPosting(expenseLedger, "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.action === "purchase" && form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden p-0"
      >
        {/* ── Fixed header ─────────────────────────────────── */}
        <div className="border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>New transaction</DialogTitle>
            <DialogDescription>Choose what happened and enter the details. The app will post it to the fixed ledgers shown below.</DialogDescription>
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
                  <SelectValue>{selectedTypeMeta?.label ?? "Choose transaction type"}</SelectValue>
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

                  <div className="grid grid-cols-2 gap-3">

                    {/* ── INCOME fields ─── */}
                    {(form.action === "sale" || form.action === "customer_payment") && (
                      <>
                        <div className="col-span-2 space-y-1.5">
                          <Label htmlFor="contact_id">Customer</Label>
                          <div className="flex items-center gap-2">
                            {addingContact ? (
                              <Input className="min-w-0 flex-1" aria-label="New customer name" autoFocus placeholder="New customer name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />
                            ) : (
                              <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                                <SelectTrigger id="contact_id" className="min-w-0 flex-1">
                                  <SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a customer"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {contacts.map((contact) => (
                                    <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => { setAddingContact((current) => !current); setField("contact_id", ""); setNewContactName("") }}>
                              {addingContact ? "Choose existing" : <><Plus className="size-4" /> Create customer</>}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">The customer name will be saved with this transaction.</p>
                        </div>
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="sale-payment-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="sale-payment-status" className="w-full"><SelectValue>{form.payment_status === "unpaid" ? "Customer owes me" : "Paid now"}</SelectValue></SelectTrigger>
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
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="sale-tax-amount">Tax amount</Label>
                          <Input id="sale-tax-amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.tax_reserved} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("tax_reserved", e.target.value)} />
                          <p className="text-xs text-muted-foreground">Added to the amount due.</p>
                        </div>}
                        {((form.action === "sale" && form.payment_status === "paid") || form.action === "customer_payment") && <div className="space-y-1.5">
                          <Label htmlFor="income_payment_method">Payment Method</Label>
                          <Select
                            value={form.payment_method}
                            onValueChange={(v) => setField("payment_method", v as PaymentMethod)}
                          >
                            <SelectTrigger id="income_payment_method" className="w-full">
                              <SelectValue>{PAYMENT_METHODS.find((method) => method.value === form.payment_method)?.label ?? "Select method"}</SelectValue>
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
                      </>
                    )}

                    {/* ── EXPENSE fields ─── */}
                    {(form.type === "expense" && (form.action === "expense" || form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase")) && (
                      <>
                        <div className="col-span-2 space-y-1.5">
                          <Label htmlFor="vendor-contact">Vendor</Label>
                          <div className="flex items-center gap-2">
                            {addingContact ? (
                              <Input className="min-w-0 flex-1" aria-label="New vendor name" autoFocus placeholder="New vendor name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />
                            ) : (
                              <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                                <SelectTrigger id="vendor-contact" className="min-w-0 flex-1"><SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a vendor"}</SelectValue></SelectTrigger>
                                <SelectContent>{contacts.map((contact) => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}</SelectContent>
                              </Select>
                            )}
                            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => { setAddingContact((current) => !current); setField("contact_id", ""); setNewContactName("") }}>
                              {addingContact ? "Choose existing" : <><Plus className="size-4" /> Create vendor</>}
                            </Button>
                          </div>
                        </div>
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase") && <div className="space-y-1.5">
                          <Label htmlFor="purchase-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="purchase-status" className="w-full"><SelectValue>{form.payment_status === "unpaid" ? "I owe the vendor" : "Paid now"}</SelectValue></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">I owe the vendor</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "expense") && <div className="space-y-1.5">
                          <Label htmlFor="category">Category</Label>
                          <Select value={form.category} onValueChange={(value) => setField("category", value)}><SelectTrigger id="category" className="w-full"><SelectValue placeholder="Choose an expense category" /></SelectTrigger><SelectContent>{EXPENSE_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
                        </div>}
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
                              <SelectValue>{PAYMENT_METHODS.find((method) => method.value === form.payment_method)?.label ?? "Select method"}</SelectValue>
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
                      </>
                    )}

                    {isInventoryAction && <div className="col-span-2 space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Inventory items</p><p className="text-xs text-muted-foreground">{form.action === "sale" ? "Sale quantity cannot exceed stock on hand." : "Purchased quantities are added to stock."}</p></div><Button type="button" variant="outline" size="sm" onClick={() => setInventoryLines((current) => [...current, { product_id: "", quantity: "1" }])}>Add item</Button></div>
                      {inventoryProducts.length === 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">No active inventory products found. Add products on the Inventory page first.</p>}
                      {inventoryLines.length === 0 && inventoryProducts.length > 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">Add an item to this transaction.</p>}
                      {inventoryLines.map((line, index) => {
                        const selected = inventoryProducts.find((product) => product.id === line.product_id)
                        const unitPrice = selected ? Number(form.action === "sale" ? selected.sale_price : selected.purchase_cost) : 0
                        const usedElsewhere = new Set(inventoryLines.filter((_, lineIndex) => lineIndex !== index).map((item) => item.product_id))
                        return <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2">
                          <div className="min-w-0 space-y-1.5"><Label htmlFor={`inventory-product-${index}`}>Product</Label><Select value={line.product_id} onValueChange={(value) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, product_id: value } : item))}><SelectTrigger id={`inventory-product-${index}`} className="w-full"><SelectValue>{selected ? `${selected.name}${selected.sku ? ` · ${selected.sku}` : ""}${form.action === "sale" ? ` · ${Number(selected.quantity_on_hand)} ${selected.unit} available` : ""}` : "Select product"}</SelectValue></SelectTrigger><SelectContent>{inventoryProducts.filter((product) => !usedElsewhere.has(product.id)).map((product) => <SelectItem key={product.id} value={product.id}>{product.name}{product.sku ? ` · ${product.sku}` : ""}{form.action === "sale" ? ` · ${Number(product.quantity_on_hand)} ${product.unit} available` : ""}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{selected ? `${unitPrice.toFixed(2)} per ${selected.unit}` : "Choose an item"}</p></div>
                          <div className="space-y-1.5"><Label htmlFor={`inventory-quantity-${index}`}>Qty</Label><Input id={`inventory-quantity-${index}`} type="number" min="0.001" step="0.001" max={form.action === "sale" && selected ? selected.quantity_on_hand : undefined} required value={line.quantity} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, quantity: event.target.value } : item))} /></div>
                          <Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={() => setInventoryLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}>×</Button>
                        </div>
                      })}
                    </div>}

                    {form.action === "transfer" && <div className="col-span-2 space-y-1.5"><Label htmlFor="transfer-direction">Transfer direction</Label><Select value={form.transfer_direction} onValueChange={(value) => setField("transfer_direction", value as TransferDirection)}><SelectTrigger id="transfer-direction" className="w-full"><SelectValue>{form.transfer_direction === "cash_to_bank" ? "Cash to bank" : "Bank to cash"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="cash_to_bank">Cash to bank</SelectItem><SelectItem value="bank_to_cash">Bank to cash</SelectItem></SelectContent></Select></div>}

                  </div>
                </section>

                {/* ── Common details (last) ───────────── */}
                <section>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Common Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">
                        Amount before tax <span className="text-destructive">*</span>
                      </Label>
                      <Input
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
                      {isInventoryAction && <p className="text-xs text-muted-foreground">Calculated from the selected inventory items, before tax.</p>}
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
                    <div className="col-span-2 space-y-1.5">
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

              </>
            )}
          </div>
        </form>

        {/* ── Fixed footer ──────────────────────────────────── */}
        <div className="border-t border-border px-6 py-3">
          <section aria-label="Automatic double entry preview" className="mb-3 max-h-36 overflow-y-auto rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold">Automatic ledger posting</p><p className="text-[11px] text-muted-foreground">Fixed entries</p></div>
            <div className="space-y-1.5">{postingPreview.map((line, index) => <div key={`${line.ledger}-${line.side}-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs sm:text-sm"><span className="min-w-0 truncate">{line.ledger}</span><span className={`font-semibold uppercase ${line.side === "Debit" ? "text-blue-700 dark:text-blue-300" : "text-violet-700 dark:text-violet-300"}`}>{line.side}</span><span className="text-right tabular-nums">{line.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>)}</div>
          </section>
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

