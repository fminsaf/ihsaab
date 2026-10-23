import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useOutletContext } from "react-router"
import { ArrowDownRight, ArrowUpRight, Landmark, Plus, RefreshCw, Scale, Wallet, TrendingUp, ChartNoAxesCombined, ReceiptText } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { LEDGER_ACCOUNTS, LEDGER_BY_CODE, normalDebit } from "../../../lib/ledgerAccounts"
import { fetchAllRows } from "../../../lib/fetchAllRows"

interface PostingLine { account_code: string; debit: number; credit: number }
interface Transaction { id: string; date: string | null; created_at: string; ledger_lines: PostingLine[] | null }
interface Context { bid: string; setNewEntryOpen: (open: boolean) => void; currentBusinessName: string; currentBusinessCurrency?: string }
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function OverviewPage() {
  const { bid, setNewEntryOpen, currentBusinessName, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const year = new Date().getFullYear()

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchAllRows((from, to) => supabase.from("transactions").select("id, date, created_at, ledger_lines").eq("business_id", bid).order("created_at", { ascending: true }).range(from, to))
    setTransactions(result.data ?? [])
    setError(result.error?.message ?? "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const postings = transactions.flatMap((transaction) => transaction.ledger_lines ?? [])
  const balanceFor = (code: string) => {
    const movement = postings.filter((line) => line.account_code === code).reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0)
    const account = LEDGER_BY_CODE.get(code)
    return account && normalDebit(account) ? movement : -movement
  }
  const accountTotal = (category: string) => LEDGER_ACCOUNTS.filter((account) => account.category === category).reduce((sum, account) => sum + balanceFor(account.code), 0)
  const assets = accountTotal("asset")
  const liabilities = accountTotal("liability")
  const equityAccounts = accountTotal("equity")
  const allTimeIncome = postings.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "income" ? Number(line.credit || 0) - Number(line.debit || 0) : 0), 0)
  const allTimeExpenses = postings.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "expense" ? Number(line.debit || 0) - Number(line.credit || 0) : 0), 0)
  const cash = balanceFor("cash") + balanceFor("bank")

  const monthly = useMemo(() => MONTHS.map((month, index) => {
    const lines = transactions.filter((row) => {
      const date = new Date(`${(row.date || row.created_at).slice(0, 10)}T00:00:00`)
      return date.getFullYear() === year && date.getMonth() === index
    }).flatMap((row) => row.ledger_lines ?? [])
    return {
      month,
      income: lines.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "income" ? Number(line.credit || 0) - Number(line.debit || 0) : 0), 0),
      expenses: lines.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "expense" ? Number(line.debit || 0) - Number(line.credit || 0) : 0), 0),
    }
  }), [transactions, year])
  const yearIncome = monthly.reduce((sum, row) => sum + row.income, 0)
  const yearExpenses = monthly.reduce((sum, row) => sum + row.expenses, 0)
  const yearCogs = transactions.filter((row) => new Date(`${(row.date || row.created_at).slice(0, 10)}T00:00:00`).getFullYear() === year)
    .flatMap((row) => row.ledger_lines ?? []).filter((line) => line.account_code === "cost_of_goods_sold")
    .reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0)
  const expenseCategories = useMemo(() => {
    const totals = new Map<string, number>()
    transactions.filter((row) => new Date(`${(row.date || row.created_at).slice(0, 10)}T00:00:00`).getFullYear() === year)
      .flatMap((row) => row.ledger_lines ?? []).filter((line) => LEDGER_BY_CODE.get(line.account_code)?.category === "expense")
      .forEach((line) => {
        const name = LEDGER_BY_CODE.get(line.account_code)?.name ?? "Other expense"
        totals.set(name, (totals.get(name) ?? 0) + Number(line.debit || 0) - Number(line.credit || 0))
      })
    return [...totals.entries()].filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [transactions, year])

  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0)
  const ratio = (numerator: number, denominator: number) => denominator > 0 ? `${(numerator / denominator * 100).toFixed(1)}%` : "—"
  const assetCoverageRatio = liabilities > 0 ? `${((balanceFor("cash") + balanceFor("bank") + balanceFor("accounts_receivable") + balanceFor("inventory") + balanceFor("prepaid_expenses")) / liabilities).toFixed(2)}×` : "—"
  const maxValue = Math.max(1, ...monthly.flatMap((row) => [row.income, row.expenses]))
  const cards = [
    { label: `Income · ${year}`, value: yearIncome, icon: ArrowDownRight, tint: "text-emerald-600 bg-emerald-500/10" },
    { label: `Expenses · ${year}`, value: yearExpenses, icon: ArrowUpRight, tint: "text-red-600 bg-red-500/10" },
    { label: `Net profit · ${year}`, value: yearIncome - yearExpenses, icon: TrendingUp, tint: "text-primary bg-primary/10" },
    { label: "Cash & bank", value: cash, icon: Wallet, tint: "text-blue-600 bg-blue-500/10" },
    { label: "What customers owe", value: balanceFor("accounts_receivable"), icon: ReceiptText, tint: "text-violet-600 bg-violet-500/10" },
    { label: "What you owe", value: balanceFor("accounts_payable"), icon: Landmark, tint: "text-amber-600 bg-amber-500/10" },
  ]
  const ratios = [
    { label: "Gross margin", value: ratio(yearIncome - yearCogs, yearIncome), detail: "After cost of goods sold" },
    { label: "Expenses to income", value: ratio(yearExpenses, yearIncome), detail: "This calendar year" },
    { label: "Current asset coverage", value: assetCoverageRatio, detail: "Cash, receivables, inventory & prepaids ÷ total liabilities" },
  ]

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">{currentBusinessName}</h2><p className="mt-1 text-sm text-muted-foreground">Cash, profit, and business trends at a glance.</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh overview" onClick={() => void load()}><RefreshCw className="size-4" /></Button><Button className="gap-2 rounded-full" onClick={() => setNewEntryOpen(true)}><Plus className="size-4" />New entry</Button></div></div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><span>Could not load financial overview: {error}</span><Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button></div>}

    <section aria-label="Key amounts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-xs"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{card.label}</p><span className={`flex size-10 items-center justify-center rounded-xl ${card.tint}`}><card.icon className="size-4" /></span></div><p className="mt-5 text-2xl font-bold tabular-nums">{loading ? <span className="inline-block h-7 w-36 animate-pulse rounded bg-muted" /> : format(card.value)}</p></div>)}
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.8fr)]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Income and expenses</h3><p className="mt-1 text-sm text-muted-foreground">Monthly totals for {year}, based on posted ledger entries.</p></div><ChartNoAxesCombined className="size-5 text-muted-foreground" aria-hidden="true" /></div>
        {loading ? <div className="mt-6 h-64 animate-pulse rounded-xl bg-muted" /> : transactions.length ? <><div className="mt-7 flex h-56 items-end gap-1 border-b border-border px-1 sm:gap-2">{monthly.map((row) => <div key={row.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[calc(100%-1.5rem)] w-full items-end justify-center gap-1" aria-label={`${row.month}: ${format(row.income)} income, ${format(row.expenses)} expenses`}><div title={`${row.month} income: ${format(row.income)}`} className="w-2/5 max-w-5 rounded-t-md bg-emerald-500" style={{ height: `${Math.max(row.income ? 3 : 0, Math.max(0, row.income) / maxValue * 100)}%` }} /><div title={`${row.month} expenses: ${format(row.expenses)}`} className="w-2/5 max-w-5 rounded-t-md bg-red-400" style={{ height: `${Math.max(row.expenses ? 3 : 0, Math.max(0, row.expenses) / maxValue * 100)}%` }} /></div><span className="text-[10px] text-muted-foreground sm:text-xs">{row.month}</span></div>)}</div><div className="mt-4 flex gap-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-sm bg-emerald-500" />Income</span><span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-sm bg-red-400" />Expenses</span></div></> : <div className="flex h-56 flex-col items-center justify-center text-center"><ChartNoAxesCombined className="size-8 text-muted-foreground/50" /><p className="mt-3 font-medium">No chart data yet</p><p className="mt-1 text-sm text-muted-foreground">Record an entry to see monthly income and expenses.</p></div>}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Key ratios</h3><p className="mt-1 text-sm text-muted-foreground">A quick read on this year and your balance sheet.</p></div><Scale className="size-5 text-muted-foreground" aria-hidden="true" /></div>
        {loading ? <div className="mt-6 space-y-4">{ratios.map((item) => <div key={item.label} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div> : <div className="mt-5 divide-y divide-border">{ratios.map((item) => <div key={item.label} className="py-4 first:pt-0 last:pb-0"><div className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium">{item.label}</span><span className="text-xl font-bold tabular-nums">{item.value}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div>)}</div>}
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Top expense accounts</h3><p className="mt-1 text-sm text-muted-foreground">Posted expenses this year</p></div><Link to={`/b/${bid}/statements`} className="text-sm font-medium text-primary hover:underline">View statements</Link></div>
        {loading ? <div className="mt-5 h-32 animate-pulse rounded-xl bg-muted" /> : expenseCategories.length ? <div className="mt-5 space-y-4">{expenseCategories.map(([name, value]) => <div key={name}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{name}</span><span className="shrink-0 font-medium tabular-nums">{format(value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, value / expenseCategories[0][1] * 100)}%` }} /></div></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">No expense activity recorded this year.</p>}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Balance sheet snapshot</h3><p className="mt-1 text-sm text-muted-foreground">Current balances from all posted entries</p></div><Link to={`/b/${bid}/statements`} className="text-sm font-medium text-primary hover:underline">Full statements</Link></div>
        {loading ? <div className="mt-5 h-32 animate-pulse rounded-xl bg-muted" /> : <div className="mt-4 divide-y divide-border">{[{ label: "Assets", value: assets, icon: Wallet }, { label: "Liabilities", value: liabilities, icon: Landmark }, { label: "Equity incl. recorded profit", value: equityAccounts + allTimeIncome - allTimeExpenses, icon: Scale }].map((item) => <div key={item.label} className="flex items-center justify-between gap-3 py-3"><span className="flex items-center gap-2 text-sm text-muted-foreground"><item.icon className="size-4" />{item.label}</span><span className="font-semibold tabular-nums">{format(item.value)}</span></div>)}</div>}
      </div>
    </section>
  </div>
}
