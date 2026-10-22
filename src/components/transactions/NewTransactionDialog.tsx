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
type EntryAction = "sale" | "customer_payment" | "purchase" | "expense" | "transfer"
type PaymentMethod = "cash" | "bank_transfer" | "card"

interface Account {
  id: string
  name: string
  type: string
  code?: string
}

interface ContactOption {
  id: string
  name: string
}

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
  { value: "card", label: "Card" },
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
  const [addingContact, setAddingContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [saving, setSaving] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  // ── Fetch accounts for this business ──────────────────────────────────────
  useEffect(() => {
    if (!open || !businessId) return
    setLoadingAccounts(true)
    supabase.from("contacts").select("id, name").eq("business_id", businessId).order("name")
      .then(({ data }) => setContacts(data ?? []))
    supabase
      .from("accounts")
      .select("id, name, type, code")
      .eq("business_id", businessId)
      .order("code", { ascending: true })
      .then(({ data, error }) => {
        setLoadingAccounts(false)
        if (error) {
          toast.add({ description: "Failed to load accounts.", type: "error" })
        } else {
          setAccounts(data ?? [])
        }
      })
  }, [open, businessId])

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
  }

  function handleClose() {
    if (saving) return
    setForm(EMPTY_FORM)
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
    if (!form.amount || isNaN(amount) || amount < 0) {
      toast.add({ description: "Please enter a valid amount (≥ 0).", type: "error" })
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
    if (form.action === "purchase" && !form.contact_id && !newContactName.trim()) {
      toast.add({ description: "Choose a vendor or add a new one.", type: "error" })
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

    // Build type-specific payload — only include relevant columns
    const basePayload = {
      business_id: businessId,
      contact_id: contactId,
      date: form.date,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description || null,
      debit_account_id: form.debit_account_id || null,
      credit_account_id: form.credit_account_id || null,
    }

    let typePayload: Record<string, unknown> = {}

    if (form.action === "sale") {
      typePayload = {
        category: form.payment_status === "paid"
          ? `Sale · Paid${form.payment_method ? ` · ${form.payment_method}` : ""}`
          : "Sale · Unpaid",
        tax_reserved: null,
      }
    } else if (form.action === "customer_payment") {
      typePayload = { category: `Customer payment${form.payment_method ? ` · ${form.payment_method}` : ""}`, tax_reserved: null }
    } else if (form.action === "purchase") {
      typePayload = {
        category: ["Purchase", form.payment_status === "paid" ? "Paid" : "Unpaid", form.category.trim()].filter(Boolean).join(" · "),
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
        category: form.category || form.vendor || null,
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

  const selectedTypeMeta = TRANSACTION_TYPES.find((t) => t.value === form.type)

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
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What happened?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TRANSACTION_TYPES.map((t) => {
                  const Icon = t.icon
                  const active = form.type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeSelect(t.value)}
                      className={[
                        "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all focus:outline-none focus:ring-2 focus:ring-ring",
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-muted/30 hover:border-border/80 hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex size-8 items-center justify-center rounded-xl",
                          active ? t.bg : "bg-muted",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "size-4",
                            active ? t.color : "text-muted-foreground",
                          ].join(" ")}
                        />
                      </div>
                      <span
                        className={[
                          "text-xs font-semibold",
                          active ? "text-foreground" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedTypeMeta && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedTypeMeta.description}
                </p>
              )}
            </section>

            {/* ── Sections 2 & 3: Only shown after type is selected ── */}
            {form.type && (
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
                        value={form.amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("amount", e.target.value)
                        }
                        required
                      />
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
                      </>
                    )}

                    {/* ── EXPENSE fields ─── */}
                    {(form.type === "expense" && (form.action === "expense" || form.action === "purchase")) && (
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
                        {form.action === "purchase" && <div className="space-y-1.5">
                          <Label htmlFor="purchase-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="purchase-status" className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">I owe the vendor</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        <div className="space-y-1.5">
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
                        </div>
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
                        {(form.action !== "purchase" || form.payment_status === "paid") && <div className="space-y-1.5">
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
                      </>
                    )}

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

