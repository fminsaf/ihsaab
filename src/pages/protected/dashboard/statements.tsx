import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { Download, FileSpreadsheet, Printer, RefreshCw } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"

interface Transaction { id: string; type: string; amount: number; category: string | null; description: string | null; created_at: string; date: string | null }
interface Account { id: string; name: string; category: string | null; balance: number | null }
interface Context { bid: string; currentBusinessName: string; currentBusinessCurrency?: string }
type StatementKind = "profit-loss" | "balance-sheet" | "cash-flow"
const STATEMENTS: { id: StatementKind; title: string }[] = [
  { id: "profit-loss", title: "Profit & loss" },
  { id: "balance-sheet", title: "Balance sheet" },
  { id: "cash-flow", title: "Cash flow" },
]

export default function StatementsPage() {
  const { bid, currentBusinessName, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const today = new Date()
  const [kind, setKind] = useState<StatementKind>("profit-loss")
  const [from, setFrom] = useState(`${today.getFullYear()}-01-01`)
  const [to, setTo] = useState(today.toISOString().slice(0, 10))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const [txResult, accountResult] = await Promise.all([
      supabase.from("transactions").select("id, type, amount, category, description, created_at, date").eq("business_id", bid).order("created_at", { ascending: true }).limit(5000),
      supabase.from("accounts").select("id, name, category, balance").eq("business_id", bid).order("name"),
    ])
    setTransactions(txResult.data ?? [])
    setAccounts((accountResult.data ?? []) as Account[])
    setError(txResult.error?.message || accountResult.error?.message || "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const periodTransactions = useMemo(() => transactions.filter((row) => {
    const date = row.date || row.created_at.slice(0, 10)
    return date >= from && date <= to
  }), [transactions, from, to])
  const reversalPrefix = "correction reversal · "
  const revenueRows = periodTransactions.filter((row) => row.type === "income" && !row.category?.toLowerCase().startsWith("customer payment") && !row.category?.toLowerCase().startsWith("correction reversal"))
  const expenseRows = periodTransactions.filter((row) => row.type === "expense" && !row.category?.toLowerCase().startsWith("correction reversal"))
  const reversedRevenue = periodTransactions.filter((row) => row.type === "expense" && row.category?.toLowerCase().startsWith(reversalPrefix) && !row.category.toLowerCase().startsWith(`${reversalPrefix}customer payment`)).map((row) => ({ ...row, amount: -Number(row.amount), category: row.category!.slice(reversalPrefix.length) }))
  const reversedExpenses = periodTransactions.filter((row) => row.type === "income" && row.category?.toLowerCase().startsWith(reversalPrefix) && !row.category.toLowerCase().startsWith(`${reversalPrefix}customer payment`)).map((row) => ({ ...row, amount: -Number(row.amount), category: row.category!.slice(reversalPrefix.length) }))
  const statementRevenueRows = [...revenueRows, ...reversedRevenue]
  const statementExpenseRows = [...expenseRows, ...reversedExpenses]
  const revenue = statementRevenueRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const expenses = statementExpenseRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const netIncome = revenue - expenses
  const cashIn = periodTransactions.filter((row) => row.type === "income" && !row.category?.toLowerCase().includes("unpaid")).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const cashOut = periodTransactions.filter((row) => row.type === "expense" && !row.category?.toLowerCase().includes("unpaid")).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const cashNet = cashIn - cashOut
  const accountCategory = (account: Account) => (account.category ?? "uncategorized").toLowerCase()
  const accountsBy = (category: string) => accounts.filter((account) => accountCategory(account) === category)
  const assets = accountsBy("asset").reduce((sum, row) => sum + Number(row.balance || 0), 0)
  const liabilities = accountsBy("liability").reduce((sum, row) => sum + Number(row.balance || 0), 0)
  const equity = accountsBy("equity").reduce((sum, row) => sum + Number(row.balance || 0), 0) + netIncome
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  const title = STATEMENTS.find((item) => item.id === kind)?.title ?? "Financial statement"

  function exportPdf() {
    document.title = `${currentBusinessName} ${title}`
    window.print()
  }

  const Row = ({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) => <div className={`flex items-center justify-between gap-4 py-2 ${strong ? "border-t border-border font-bold" : "border-b border-border/60 text-muted-foreground"}`}><span>{label}</span><span className="tabular-nums">{format(value)}</span></div>
  const AccountRows = ({ category }: { category: string }) => <>{accountsBy(category).map((account) => <Row key={account.id} label={account.name} value={Number(account.balance || 0)} />)}{accountsBy(category).length === 0 && <p className="py-2 text-sm text-muted-foreground">No {category} balances recorded.</p>}</>

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3 no-print"><div><h2 className="text-xl font-bold">Financial statements</h2><p className="mt-1 text-sm text-muted-foreground">Review and print reports for {currentBusinessName}.</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh statements" onClick={() => void load()}><RefreshCw className="size-4" /></Button><Button className="gap-2" onClick={exportPdf}><Download className="size-4" />Export A4 PDF</Button></div></div>
    {error && <p role="alert" className="no-print rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load statement data: {error}</p>}
    <section className="no-print rounded-2xl border border-border bg-card p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Statement type">{STATEMENTS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={kind === item.id} onClick={() => setKind(item.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${kind === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{item.title}</button>)}</div><div className="flex items-end gap-3"><label className="space-y-1 text-xs text-muted-foreground">From<input className="block h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label><label className="space-y-1 text-xs text-muted-foreground">To<input className="block h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label></div></div></section>
    {loading ? <div className="h-[600px] animate-pulse rounded-2xl bg-muted" /> : <article className="financial-statement rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-10 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
      <header className="mb-8 border-b border-border pb-5 text-center print:border-black"><div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary print:hidden"><FileSpreadsheet className="size-5" /></div><p className="text-sm font-semibold text-muted-foreground print:text-black">{currentBusinessName}</p><h1 className="mt-1 text-2xl font-bold print:text-2xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground print:text-black">{kind === "balance-sheet" ? `As of ${new Date(to).toLocaleDateString()}` : `${new Date(from).toLocaleDateString()} to ${new Date(to).toLocaleDateString()}`}</p></header>
      {kind === "profit-loss" && <div className="mx-auto max-w-2xl space-y-7"><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Revenue</h2>{statementRevenueRows.length ? Object.entries(statementRevenueRows.reduce<Record<string, number>>((totals, row) => { const key = row.category || "Income"; totals[key] = (totals[key] || 0) + Number(row.amount || 0); return totals }, {})).map(([label, value]) => <Row key={label} label={label} value={value} />) : <p className="py-2 text-sm text-muted-foreground">No revenue recorded in this period.</p>}<Row label="Total revenue" value={revenue} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Expenses</h2>{statementExpenseRows.length ? Object.entries(statementExpenseRows.reduce<Record<string, number>>((totals, row) => { const key = row.category || "Expense"; totals[key] = (totals[key] || 0) + Number(row.amount || 0); return totals }, {})).map(([label, value]) => <Row key={label} label={label} value={value} />) : <p className="py-2 text-sm text-muted-foreground">No expenses recorded in this period.</p>}<Row label="Total expenses" value={expenses} strong /></section><Row label="Net income" value={netIncome} strong /></div>}
      {kind === "balance-sheet" && <div className="mx-auto max-w-2xl space-y-7"><p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 print:border-black print:bg-white print:text-black">Account balances are shown as currently saved. Transactions have not yet been posted into account balances.</p><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Assets</h2><AccountRows category="asset" /><Row label="Total assets" value={assets} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Liabilities</h2><AccountRows category="liability" /><Row label="Total liabilities" value={liabilities} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Equity</h2><AccountRows category="equity" /><Row label="Current period net income" value={netIncome} /><Row label="Total equity" value={equity} strong /></section><Row label="Liabilities and equity" value={liabilities + equity} strong /></div>}
      {kind === "cash-flow" && <div className="mx-auto max-w-2xl space-y-7"><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Cash received</h2><Row label="Recorded income and customer payments" value={cashIn} /><Row label="Total cash received" value={cashIn} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Cash paid</h2><Row label="Recorded paid expenses and purchases" value={cashOut} /><Row label="Total cash paid" value={cashOut} strong /></section><Row label="Net cash activity" value={cashNet} strong /><p className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground print:border-black print:bg-white print:text-black">Unpaid sales and purchases are excluded where their payment status is recorded. Older transactions without payment details are treated as cash activity.</p></div>}
      <footer className="mt-12 border-t border-border pt-4 text-center text-[10px] text-muted-foreground print:border-black print:text-black">Generated from records in {currentBusinessName} · {new Date().toLocaleString()}</footer>
    </article>}
    <p className="no-print text-xs text-muted-foreground"><Printer className="mr-1 inline size-3" />Export opens your browser print dialog. Choose “Save as PDF” to download an A4 file.</p>
  </div>
}
