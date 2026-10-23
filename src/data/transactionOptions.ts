import type { ComponentType } from "react"
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react"

export type TransactionType = "income" | "expense" | "transfer"
export type EntryAction = "sale" | "service_income" | "customer_payment" | "purchase" | "stock_purchase" | "asset_purchase" | "expense" | "transfer"
export type PaymentMethod = "cash" | "bank_transfer"
export type TransferDirection = "cash_to_bank" | "bank_to_cash"

export interface ContactOption {
  id: string
  name: string
}

export interface InventoryProduct {
  id: string
  name: string
  sku: string | null
  unit: string
  quantity_on_hand: number
  sale_price: number
  purchase_cost: number
  average_cost: number
}
export interface InventoryLine { product_id: string; quantity: string }

export interface FormState {
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

export const TRANSACTION_TYPES: {
  value: EntryAction
  transactionType: TransactionType
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
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
    value: "service_income",
    transactionType: "income",
    label: "Service income",
    description: "Record services, project work, or other income without inventory",
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

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
]
export const EXPENSE_CATEGORIES = ["Advertising & Marketing", "Bank Charges", "Electricity & Utilities", "Insurance Expense", "Internet & Telephone", "Office Supplies", "Rent Expense", "Repairs & Maintenance", "Salaries & Wages", "Taxes & Licenses", "Transport & Travel", "Miscellaneous Expenses"]

export const EMPTY_FORM: FormState = {
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

