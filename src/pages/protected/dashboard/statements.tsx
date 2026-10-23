import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { Download, FileSpreadsheet, Printer, RefreshCw } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { LEDGER_ACCOUNTS, normalDebit } from "../../../lib/ledgerAccounts"
import { fetchAllRows } from "../../../lib/fetchAllRows"

interface PostingLine { account_code: string; debit: number; credit: number }
interface Transaction { id: string; type: string; amount: number; category: string | null; description: string | null; created_at: string; date: string | null; ledger_lines: PostingLine[] | null }
type Account = (typeof LEDGER_ACCOUNTS)[number]
interface Context { bid: string; currentBusinessName: string; currentBusinessCurrency?: string }
type StatementKind = "profit-loss" | "balance-sheet" | "cash-flow" | "trial-balance"
const STATEMENTS: { id: StatementKind; title: string }[] = [
  { id: "profit-loss", title: "Profit & loss" },
  { id: "balance-sheet", title: "Balance sheet" },
  { id: "cash-flow", title: "Cash flow" },
  { id: "trial-balance", title: "Trial balance" },
]
const displayDate = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString()

export default function StatementsPage() {
  const { bid, currentBusinessName, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const today = new Date()
  const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const [kind, setKind] = useState<StatementKind>("profit-loss")
  const [from, setFrom] = useState(`${today.getFullYear()}-01-01`)
  const [to, setTo] = useState(todayLocal)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const accounts: Account[] = LEDGER_ACCOUNTS
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const txResult = await fetchAllRows((from, to) => supabase.from("transactions").select("id, type, amount, category, description, created_at, date, ledger_lines").eq("business_id", bid).order("created_at", { ascending: true }).range(from, to))
    setTransactions(txResult.data ?? [])
    setError(txResult.error?.message || "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const periodTransactions = useMemo(() => transactions.filter((row) => {
    const date = row.date || row.created_at.slice(0, 10)
    return date >= from && date <= to
  }), [transactions, from, to])
  const accountById = new Map(accounts.map((account) => [account.code, account]))
  const statementLines = periodTransactions.flatMap((transaction) => transaction.ledger_lines ?? [])
  const totalsByCategory = (category: string, side: "credit" | "debit") => {
    const values = new Map<string, number>()
    for (const line of statementLines) {
      const account = accountById.get(line.account_code)
      if (account?.category?.toLowerCase() !== category) continue
      const amount = Number(line[side] || 0) - Number(line[side === "credit" ? "debit" : "credit"] || 0)
      values.set(account.name, (values.get(account.name) ?? 0) + amount)
    }
    return [...values.entries()].filter(([, value]) => Math.abs(value) > 0.0001).map(([category, amount]) => ({ category, amount }))
  }
  const statementRevenueRows = totalsByCategory("income", "credit")
  const statementExpenseRows = totalsByCategory("expense", "debit")
  const revenue = statementRevenueRows.reduce((sum, row) => sum + row.amount, 0)
  const expenses = statementExpenseRows.reduce((sum, row) => sum + row.amount, 0)
  const netIncome = revenue - expenses
  const cashAccountIds = new Set(["cash", "bank"])
  const cashFlows = { operating: 0, investing: 0, financing: 0, unclassified: 0 }
  for (const transaction of periodTransactions) {
    if (transaction.type === "opening") continue
    for (const cashLine of transaction.ledger_lines ?? []) {
      if (!cashAccountIds.has(cashLine.account_code)) continue
      const counterparts = (transaction.ledger_lines ?? []).filter((line) => !cashAccountIds.has(line.account_code))
      if (!counterparts.length) continue // cash-to-bank transfers do not change total cash
      const code = counterparts.map((line) => line.account_code).join(" ")
      const section = /property_plant_equipment|accumulated_depreciation|intangible|investment/.test(code)
        ? "investing"
        : /loans_payable|owners_equity|owner_drawings/.test(code)
        ? "financing"
        : /sales_revenue|service_revenue|other_income|sales_returns|cost_of_goods_sold|advertising|bank_charges|depreciation_expense|utilities|insurance|interest_expense|internet_telephone|office_supplies|rent|repairs|salaries|taxes_licenses|transport|misc_expense|accounts_receivable|accounts_payable|taxes_payable|input_tax_recoverable|inventory|prepaid_expenses|wages_payable|customer_advances/.test(code)
        ? "operating"
        : "unclassified"
      cashFlows[section] += Number(cashLine.debit || 0) - Number(cashLine.credit || 0)
    }
  }
  const cashNet = cashFlows.operating + cashFlows.investing + cashFlows.financing + cashFlows.unclassified
  const beginningCash = transactions.filter((transaction) => (transaction.date || transaction.created_at.slice(0, 10)) < from).flatMap((transaction) => transaction.ledger_lines ?? []).reduce((sum, line) => sum + (cashAccountIds.has(line.account_code) ? Number(line.debit || 0) - Number(line.credit || 0) : 0), 0)
  const openingAdjustments = periodTransactions.filter((transaction) => transaction.type === "opening").flatMap((transaction) => transaction.ledger_lines ?? []).reduce((sum, line) => sum + (cashAccountIds.has(line.account_code) ? Number(line.debit || 0) - Number(line.credit || 0) : 0), 0)
  const endingCash = beginningCash + openingAdjustments + cashNet
  const accountCategory = (account: Account) => account.category.toLowerCase()
  const accountsBy = (category: string) => accounts.filter((account) => accountCategory(account) === category)
  const balanceLines = transactions.filter((transaction) => (transaction.date || transaction.created_at.slice(0, 10)) <= to).flatMap((transaction) => transaction.ledger_lines ?? [])
  const balanceIncome = balanceLines.reduce((sum, line) => sum + (accountById.get(line.account_code)?.category?.toLowerCase() === "income" ? Number(line.credit || 0) - Number(line.debit || 0) : 0), 0)
  const balanceExpenses = balanceLines.reduce((sum, line) => sum + (accountById.get(line.account_code)?.category?.toLowerCase() === "expense" ? Number(line.debit || 0) - Number(line.credit || 0) : 0), 0)
  const balanceNetIncome = balanceIncome - balanceExpenses
  const balanceFor = (account: Account) => {
    const movement = balanceLines.filter((line) => line.account_code === account.code).reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0)
    return normalDebit(account) ? movement : -movement
  }
  const trialRows = accounts.map((account) => {
    const movement = balanceLines.filter((line) => line.account_code === account.code).reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0)
    return { account, debit: Math.max(normalDebit(account) ? movement : -movement, 0), credit: Math.max(normalDebit(account) ? -movement : movement, 0) }
  }).filter((row) => row.debit > 0.0001 || row.credit > 0.0001)
  const trialDebit = trialRows.reduce((sum, row) => sum + row.debit, 0)
  const trialCredit = trialRows.reduce((sum, row) => sum + row.credit, 0)
  const assets = accountsBy("asset").reduce((sum, row) => sum + balanceFor(row), 0)
  const liabilities = accountsBy("liability").reduce((sum, row) => sum + balanceFor(row), 0)
  const equity = accountsBy("equity").reduce((sum, row) => sum + balanceFor(row), 0) + balanceNetIncome
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  const title = STATEMENTS.find((item) => item.id === kind)?.title ?? "Financial statement"

  function exportPdf() {
    document.title = `${currentBusinessName} ${title}`
    window.print()
  }

  const Row = ({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) => <div className={`flex items-center justify-between gap-4 py-2 ${strong ? "border-t border-border font-bold" : "border-b border-border/60 text-muted-foreground"}`}><span>{label}</span><span className="tabular-nums">{format(value)}</span></div>
  const AccountRows = ({ category }: { category: string }) => <>{accountsBy(category).map((account) => <Row key={account.code} label={account.name} value={balanceFor(account)} />)}{accountsBy(category).length === 0 && <p className="py-2 text-sm text-muted-foreground">No {category} balances recorded.</p>}</>

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3 no-print"><div><h2 className="text-xl font-bold">Financial statements</h2><p className="mt-1 text-sm text-muted-foreground">Review and print reports for {currentBusinessName}.</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Refresh statements" onClick={() => void load()}><RefreshCw className="size-4" /></Button><Button className="gap-2" onClick={exportPdf}><Download className="size-4" />Export A4 PDF</Button></div></div>
    {error && <p role="alert" className="no-print rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load statement data: {error}</p>}
    <section className="no-print rounded-2xl border border-border bg-card p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Statement type">{STATEMENTS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={kind === item.id} onClick={() => setKind(item.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${kind === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{item.title}</button>)}</div><div className="flex items-end gap-3"><label className="space-y-1 text-xs text-muted-foreground">From<input className="block h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label><label className="space-y-1 text-xs text-muted-foreground">To<input className="block h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label></div></div></section>
    {loading ? <div className="h-[600px] animate-pulse rounded-2xl bg-muted" /> : <article className="financial-statement rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-10 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
      <header className="mb-8 border-b border-border pb-5 text-center print:border-black"><div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary print:hidden"><FileSpreadsheet className="size-5" /></div><p className="text-sm font-semibold text-muted-foreground print:text-black">{currentBusinessName}</p><h1 className="mt-1 text-2xl font-bold print:text-2xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground print:text-black">{kind === "balance-sheet" ? `As of ${displayDate(to)}` : `${displayDate(from)} to ${displayDate(to)}`}</p></header>
      {kind === "profit-loss" && <div className="mx-auto max-w-2xl space-y-7"><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Revenue</h2>{statementRevenueRows.length ? statementRevenueRows.map((row) => <Row key={row.category} label={row.category} value={row.amount} />) : <p className="py-2 text-sm text-muted-foreground">No revenue recorded in this period.</p>}<Row label="Total revenue" value={revenue} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Expenses</h2>{statementExpenseRows.length ? statementExpenseRows.map((row) => <Row key={row.category} label={row.category} value={row.amount} />) : <p className="py-2 text-sm text-muted-foreground">No expenses recorded in this period.</p>}<Row label="Total expenses" value={expenses} strong /></section><Row label="Net income" value={netIncome} strong /></div>}
      {kind === "balance-sheet" && <div className="mx-auto max-w-2xl space-y-7"><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Assets</h2><AccountRows category="asset" /><Row label="Total assets" value={assets} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Liabilities</h2><AccountRows category="liability" /><Row label="Total liabilities" value={liabilities} strong /></section><section><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Equity</h2><AccountRows category="equity" /><Row label="Accumulated net income" value={balanceNetIncome} /><Row label="Total equity" value={equity} strong /></section><Row label="Liabilities and equity" value={liabilities + equity} strong /></div>}
      {kind === "cash-flow" && <div className="mx-auto max-w-2xl space-y-7"><Row label="Beginning cash and bank balance" value={beginningCash} strong /><Row label="Opening balance adjustments" value={openingAdjustments} />{(["operating", "investing", "financing", "unclassified"] as const).map((section) => <section key={section}><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">{section} activities</h2><Row label={`Net ${section.toLowerCase()} cash flow`} value={cashFlows[section]} strong /></section>)}<Row label="Net change in cash" value={cashNet + openingAdjustments} strong /><Row label="Ending cash and bank balance" value={endingCash} strong /><p className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground print:border-black print:bg-white print:text-black">Transfers between cash and bank are excluded from activity. Movements are grouped by the account paired with cash; unrecognized account types remain unclassified.</p></div>}
      {kind === "trial-balance" && <div className="mx-auto max-w-3xl"><p className="mb-4 text-sm text-muted-foreground">Account balances as of {displayDate(to)} · {Math.abs(trialDebit - trialCredit) < 0.01 ? "Debits equal credits" : "Debits and credits do not balance"}</p><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><span>Ledger</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div><div className="divide-y divide-border">{trialRows.map(({ account, debit, credit }) => <div key={account.code} className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-2 py-2.5 text-sm"><span className="min-w-0"><span className="block truncate">{account.name}</span><span className="text-xs capitalize text-muted-foreground">{account.category}</span></span><span className="break-words text-right tabular-nums">{debit ? format(debit) : "—"}</span><span className="break-words text-right tabular-nums">{credit ? format(credit) : "—"}</span></div>)}</div><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-2 border-t border-border pt-3 text-sm font-bold"><span>Total</span><span className="text-right tabular-nums">{format(trialDebit)}</span><span className="text-right tabular-nums">{format(trialCredit)}</span></div></div>}
      <footer className="mt-12 border-t border-border pt-4 text-center text-[10px] text-muted-foreground print:border-black print:text-black">Generated from records in {currentBusinessName} · {new Date().toLocaleString()}</footer>
    </article>}
    <p className="no-print text-xs text-muted-foreground"><Printer className="mr-1 inline size-3" />Export opens your browser print dialog. Choose “Save as PDF” to download an A4 file.</p>
  </div>
}
