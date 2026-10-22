import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { NewTransactionDialog } from "../../../components/transactions/NewTransactionDialog"
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  CalendarDays,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  category: string | null
  created_at: string
}

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

  const fetchTransactions = useCallback(async () => {
    if (!bid) return
    setLoading(true)
    const { data } = await supabase
      .from("transactions")
      .select("id, type, amount, description, category, created_at")
      .eq("business_id", bid)
      .order("created_at", { ascending: false })
      .limit(100)
    setTransactions(data ?? [])
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
              <div
                key={tx.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs transition hover:bg-muted/30"
              >
                <div
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    meta.bg,
                  ].join(" ")}
                >
                  <Icon className={["size-4", meta.color].join(" ")} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.description ?? tx.category ?? "—"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={["text-sm font-bold", amountColor].join(" ")}>
                    {amountPrefix}
                    {tx.amount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
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
    </>
  )
}
