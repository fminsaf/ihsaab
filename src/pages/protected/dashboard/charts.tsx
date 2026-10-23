import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { BarChart3, RefreshCw } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { fetchAllRows } from "../../../lib/fetchAllRows"
import { LEDGER_BY_CODE } from "../../../lib/ledgerAccounts"

interface PostingLine { account_code: string; debit: number; credit: number }
interface Transaction { id: string; type: string; amount: number; category: string | null; created_at: string; date: string | null; ledger_lines: PostingLine[] | null }
interface Context { bid: string; currentBusinessCurrency?: string }
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function ChartsPage() {
  const { bid, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const [rows, setRows] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchAllRows((from, to) => supabase.from("transactions").select("id, type, amount, category, created_at, date, ledger_lines").eq("business_id", bid).order("created_at", { ascending: true }).range(from, to))
    setRows(result.data ?? [])
    setError(result.error?.message ?? "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const monthly = useMemo(() => {
    const year = new Date().getFullYear()
    return MONTHS.map((month, index) => {
      const entries = rows.filter((row) => { const date = new Date(`${row.date || row.created_at.slice(0, 10)}T00:00:00`); return date.getFullYear() === year && date.getMonth() === index })
      const lines = entries.flatMap((row) => row.ledger_lines ?? [])
      return { month, income: lines.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "income" ? Number(line.credit) - Number(line.debit) : 0), 0), expenses: lines.reduce((sum, line) => sum + (LEDGER_BY_CODE.get(line.account_code)?.category === "expense" ? Number(line.debit) - Number(line.credit) : 0), 0) }
    })
  }, [rows])
  const maxValue = Math.max(1, ...monthly.flatMap((month) => [month.income, month.expenses]))
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, maximumFractionDigits: 0 }).format(value)
  const categories = useMemo(() => {
    const sums = new Map<string, number>()
    rows.flatMap((row) => row.ledger_lines ?? []).filter((line) => LEDGER_BY_CODE.get(line.account_code)?.category === "expense").forEach((line) => { const key = LEDGER_BY_CODE.get(line.account_code)?.name ?? "Expense"; sums.set(key, (sums.get(key) ?? 0) + Number(line.debit || 0) - Number(line.credit || 0)) })
    return [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [rows])

  return <div className="mx-auto max-w-6xl space-y-5">
    <div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Charts & analytics</h2><p className="mt-1 text-sm text-muted-foreground">Monthly income and expense activity for {new Date().getFullYear()}.</p></div><Button variant="outline" size="icon" aria-label="Refresh charts" onClick={() => void load()}><RefreshCw className="size-4" /></Button></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load chart data: {error}</p>}
    {loading ? <div className="h-80 animate-pulse rounded-2xl bg-muted" /> : <>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Income and expenses</h3><p className="text-xs text-muted-foreground">{format(monthly.reduce((sum, row) => sum + row.income, 0))} income recorded · {format(monthly.reduce((sum, row) => sum + row.expenses, 0))} expenses recorded</p></div><BarChart3 className="size-5 text-muted-foreground" /></div>
        {rows.length ? <div className="mt-8 flex h-64 items-end gap-1 border-b border-border sm:gap-2">{monthly.map((month) => <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[calc(100%-2rem)] w-full items-end justify-center gap-1">{[[month.income, "bg-emerald-500"], [month.expenses, "bg-red-400"]].map(([raw, color]) => <div key={String(color)} title={format(Number(raw))} className={`w-2/5 max-w-5 rounded-t-md ${color}`} style={{ height: `${Math.max(Number(raw) ? 3 : 0, (Number(raw) / maxValue) * 100)}%` }} />)}</div><span className="text-[10px] text-muted-foreground sm:text-xs">{month.month}</span></div>)}</div> : <div className="flex h-56 flex-col items-center justify-center text-center"><BarChart3 className="size-8 text-muted-foreground/50" /><p className="mt-3 font-medium">No chart data yet</p><p className="mt-1 text-sm text-muted-foreground">Record transactions to see a monthly comparison.</p></div>}
        <div className="mt-4 flex justify-center gap-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-sm bg-emerald-500" />Income</span><span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-sm bg-red-400" />Expenses</span></div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6"><h3 className="font-semibold">Expense categories</h3><p className="mt-1 text-xs text-muted-foreground">Based on the categories recorded on expenses.</p>{categories.length ? <div className="mt-4 space-y-4">{categories.map(([name, value]) => <div key={name}><div className="mb-1 flex justify-between gap-4 text-sm"><span className="truncate">{name}</span><span className="font-medium">{format(value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (value / categories[0][1]) * 100)}%` }} /></div></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">No categorized expenses yet.</p>}</section>
    </>}
  </div>
}
