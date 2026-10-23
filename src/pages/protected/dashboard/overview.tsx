import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { ArrowDownRight, ArrowUpRight, Landmark, Plus, RefreshCw, Scale, Wallet } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"

interface Transaction { id: string; type: string; amount: number; category: string | null }
interface Account { category: string | null; balance: number | null }
interface Context { bid: string; setNewEntryOpen: (open: boolean) => void; currentBusinessName: string; currentBusinessCurrency?: string }

export default function OverviewPage() {
  const { bid, setNewEntryOpen, currentBusinessName, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const [transactionResult, accountResult] = await Promise.all([
      supabase.from("transactions").select("id, type, amount, category").eq("business_id", bid).limit(5000),
      supabase.from("accounts").select("category, balance").eq("business_id", bid),
    ])
    setTransactions(transactionResult.data ?? [])
    setAccounts(accountResult.data ?? [])
    setError(transactionResult.error?.message || accountResult.error?.message || "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const reversalPrefix = "correction reversal · "
  const revenue = transactions.filter((row) => row.type === "income" && !row.category?.toLowerCase().startsWith("customer payment") && !row.category?.toLowerCase().startsWith("correction reversal"))
  const expenses = transactions.filter((row) => row.type === "expense" && !row.category?.toLowerCase().startsWith("correction reversal"))
  const revenueReversals = transactions.filter((row) => row.type === "expense" && row.category?.toLowerCase().startsWith(reversalPrefix) && !row.category.toLowerCase().startsWith(`${reversalPrefix}customer payment`))
  const expenseReversals = transactions.filter((row) => row.type === "income" && row.category?.toLowerCase().startsWith(reversalPrefix) && !row.category.toLowerCase().startsWith(`${reversalPrefix}customer payment`))
  const totalIncome = revenue.reduce((sum, row) => sum + Number(row.amount || 0), 0) - revenueReversals.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0) - expenseReversals.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const netIncome = totalIncome - totalExpenses
  const totalFor = (category: string) => accounts.filter((account) => account.category?.toLowerCase() === category).reduce((sum, account) => sum + Number(account.balance || 0), 0)
  const assets = totalFor("asset")
  const liabilities = totalFor("liability")
  const equity = totalFor("equity") + netIncome
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  const cards = [
    { label: "Total income", value: totalIncome, icon: ArrowDownRight, tint: "text-emerald-600 bg-emerald-500/10" },
    { label: "Total expenses", value: totalExpenses, icon: ArrowUpRight, tint: "text-red-600 bg-red-500/10" },
    { label: "Assets", value: assets, icon: Wallet, tint: "text-blue-600 bg-blue-500/10" },
    { label: "Liabilities", value: liabilities, icon: Landmark, tint: "text-amber-600 bg-amber-500/10" },
    { label: "Equity", value: equity, icon: Scale, tint: "text-primary bg-primary/10" },
  ]

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">{currentBusinessName}</h2><p className="mt-1 text-sm text-muted-foreground">Financial overview</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh overview" onClick={() => void load()}><RefreshCw className="size-4" /></Button><Button className="gap-2 rounded-full" onClick={() => setNewEntryOpen(true)}><Plus className="size-4" />New entry</Button></div></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load financial overview: {error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-xs"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{card.label}</p><span className={`flex size-10 items-center justify-center rounded-xl ${card.tint}`}><card.icon className="size-4" /></span></div><p className="mt-5 text-2xl font-bold tabular-nums">{loading ? <span className="inline-block h-7 w-36 animate-pulse rounded bg-muted" /> : format(card.value)}</p></div>)}
    </div>
  </div>
}
