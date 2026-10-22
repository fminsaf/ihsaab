import { useState } from "react"
import supabase from "../lib/supabase"
import { toast } from "../components/ui/toast"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select"
import {
  ShoppingCart,
  Receipt,
  Wallet,
  RefreshCw,
  DollarSign,
  ArrowLeft,
} from "lucide-react"

// ─── Transaction type definitions ────────────────────────────────────────────

type FieldDef =
  | { kind: "text"; name: string; label: string; placeholder?: string }
  | { kind: "number"; name: string; label: string; placeholder?: string }
  | { kind: "date"; name: string; label: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "textarea"; name: string; label: string; placeholder?: string }

interface TransactionTypeDef {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  fields: FieldDef[]
}

const TRANSACTION_TYPES: TransactionTypeDef[] = [
  {
    value: "sale",
    label: "New Sale",
    icon: ShoppingCart,
    description: "Record a sale to a customer",
    fields: [
      { kind: "text", name: "customer_name", label: "Customer Name", placeholder: "e.g. Acme Corp" },
      { kind: "number", name: "amount", label: "Sale Amount", placeholder: "0.00" },
      {
        kind: "select",
        name: "payment_method",
        label: "Payment Method",
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank Transfer" },
          { value: "credit", label: "Credit (Invoice)" },
        ],
      },
      { kind: "date", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Description (optional)", placeholder: "Item / service sold…" },
    ],
  },
  {
    value: "expense",
    label: "Expense Paid",
    icon: Receipt,
    description: "Record a business expense",
    fields: [
      {
        kind: "select",
        name: "category",
        label: "Expense Category",
        options: [
          { value: "utilities", label: "Utilities" },
          { value: "rent", label: "Rent" },
          { value: "salaries", label: "Salaries" },
          { value: "supplies", label: "Supplies" },
          { value: "transport", label: "Transport" },
          { value: "other", label: "Other" },
        ],
      },
      { kind: "text", name: "vendor_name", label: "Paid To (Vendor)", placeholder: "e.g. Electricity Board" },
      { kind: "number", name: "amount", label: "Amount", placeholder: "0.00" },
      {
        kind: "select",
        name: "payment_method",
        label: "Paid From",
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank Account" },
        ],
      },
      { kind: "date", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Notes (optional)", placeholder: "Details…" },
    ],
  },
  {
    value: "customer_payment",
    label: "Customer Paid",
    icon: Wallet,
    description: "Record payment received from a customer",
    fields: [
      { kind: "text", name: "customer_name", label: "Customer Name", placeholder: "e.g. Acme Corp" },
      { kind: "number", name: "amount", label: "Amount Received", placeholder: "0.00" },
      {
        kind: "select",
        name: "payment_method",
        label: "Received Via",
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank Transfer" },
          { value: "cheque", label: "Cheque" },
        ],
      },
      { kind: "date", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Reference / Notes (optional)", placeholder: "Invoice # or note…" },
    ],
  },
  {
    value: "purchase",
    label: "Purchase / Bill",
    icon: DollarSign,
    description: "Record a purchase or supplier bill",
    fields: [
      { kind: "text", name: "vendor_name", label: "Supplier / Vendor", placeholder: "e.g. ABC Suppliers" },
      { kind: "number", name: "amount", label: "Bill Amount", placeholder: "0.00" },
      {
        kind: "select",
        name: "payment_method",
        label: "Payment Status",
        options: [
          { value: "cash", label: "Paid – Cash" },
          { value: "bank", label: "Paid – Bank" },
          { value: "credit", label: "On Credit (Payable)" },
        ],
      },
      { kind: "date", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Items / Notes (optional)", placeholder: "What was purchased…" },
    ],
  },
  {
    value: "transfer",
    label: "Fund Transfer",
    icon: RefreshCw,
    description: "Transfer money between accounts",
    fields: [
      {
        kind: "select",
        name: "from_account",
        label: "From Account",
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank" },
        ],
      },
      {
        kind: "select",
        name: "to_account",
        label: "To Account",
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank" },
        ],
      },
      { kind: "number", name: "amount", label: "Amount", placeholder: "0.00" },
      { kind: "date", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Notes (optional)", placeholder: "Reason for transfer…" },
    ],
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  setOpen: (v: boolean) => void
  businessId: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionEntryDialog({ open, setOpen, businessId }: Props) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [step, setStep] = useState<number>(0) // 0 = type picker, 1..n = fields
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const typeDef = TRANSACTION_TYPES.find((t) => t.value === selectedType)
  const currentField = typeDef ? typeDef.fields[step - 1] : null
  const totalSteps = typeDef ? typeDef.fields.length : 0
  const isLastField = step === totalSteps
  const currentValue = currentField ? (values[currentField.name] ?? "") : ""

  // A field is "filled" when it has a non-empty value
  const isCurrentFilled = currentField
    ? currentField.kind === "select"
      ? currentValue !== ""
      : currentValue.trim() !== ""
    : false

  // Optional fields (description / notes) are always satisfied
  const isOptional = currentField
    ? currentField.label.toLowerCase().includes("optional")
    : false

  const canAdvance = isOptional || isCurrentFilled

  function resetDialog() {
    setSelectedType("")
    setStep(0)
    setValues({})
    setSaving(false)
  }

  function handleClose() {
    resetDialog()
    setOpen(false)
  }

  function handleTypeSelect(v: string) {
    setSelectedType(v)
    setValues({})
    setStep(1)
  }

  function handleFieldValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleBack() {
    if (step === 1) {
      setSelectedType("")
      setStep(0)
    } else {
      setStep((s) => s - 1)
    }
  }

  function handleNext() {
    if (!canAdvance) return
    setStep((s) => s + 1)
  }

  async function handleCreate() {
    if (!typeDef) return
    setSaving(true)
    const today = new Date().toISOString().split("T")[0]
    const { error } = await supabase.from("transactions").insert({
      business_id: businessId,
      type: selectedType,
      amount: parseFloat(values["amount"] ?? "0"),
      date: values["date"] || today,
      metadata: values,
    })
    setSaving(false)
    if (error) {
      toast.add({ description: error.message, type: "error" })
    } else {
      toast.add({ description: "Transaction recorded successfully.", type: "success" })
      handleClose()
    }
  }

  // Progress bar width
  const progress = totalSteps > 0 ? Math.round((step / (totalSteps + 1)) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 0
              ? "New Transaction"
              : typeDef
              ? `${typeDef.label} — Step ${step} of ${totalSteps}`
              : "New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? "Choose the type of transaction to record."
              : currentField?.label ?? ""}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        {step > 0 && totalSteps > 0 && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Step 0: Type picker ─────────────────────────── */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TRANSACTION_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeSelect(t.value)}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-3 text-left transition hover:bg-muted hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Steps 1–n: Progressive fields ──────────────── */}
        {step > 0 && currentField && (
          <div className="space-y-3 py-1">
            <FieldInput
              field={currentField}
              value={currentValue}
              onChange={(v) => handleFieldValue(currentField.name, v)}
            />
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        {step > 0 && (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="size-3.5" />
              Back
            </Button>

            {!isLastField ? (
              <Button size="sm" onClick={handleNext} disabled={!canAdvance}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={handleCreate} disabled={!canAdvance || saving}>
                {saving ? "Saving…" : "Create Entry"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Field renderer ──────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  if (field.kind === "select") {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (field.kind === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-input/50 px-3 py-2 text-sm outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      />
    )
  }

  return (
    <Input
      type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
      placeholder={"placeholder" in field ? field.placeholder : undefined}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="w-full"
    />
  )
}
