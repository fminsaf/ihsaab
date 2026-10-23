import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useOutletContext } from "react-router"
import { BookText, RefreshCw, Search } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { fetchAllRows } from "../../../lib/fetchAllRows"
import { LEDGER_BY_CODE } from "../../../lib/ledgerAccounts"

interface PostingLine { account_code: string; debit: number; credit: number; description?: string | null }
interface Transaction { id: string; date: string | null; created_at: string; type: string; amount: number; description: string | null; category: string | null; contact_id: string | null; correction_role: string | null; ledger_lines: PostingLine[] | null }
interface Contact { id: string; name: string }
interface Context { bid: string; currentBusinessCurrency?: string }

export default function GeneralLedgerPage() {
  const { bid, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [contacts, setContacts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const [transactionResult, contactResult] = await Promise.all([
      fetchAllRows((from, to) => supabase.from("transactions").select("id, date, created_at, type, amount, description, category, contact_id, correction_role, ledger_lines").eq("business_id", bid).order("date", { ascending: false }).order("created_at", { ascending: false }).range(from, to)),
      fetchAllRows((from, to) => supabase.from("contacts").select("id, name").eq("business_id", bid).order("name").range(from, to)),
    ])
    setTransactions((transactionResult.data ?? []) as Transaction[])
    setContacts(Object.fromEntries(((contactResult.data ?? []) as Contact[]).map((contact) => [contact.id, contact.name])))
    setError(transactionResult.error?.message ?? contactResult.error?.message ?? "")
    setLoading(false)
  }, [bid])
  useEffect(() => { void load() }, [load])

  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  const posted = useMemo(() => transactions.map((transaction) => ({
    ...transaction,
    lines: transaction.ledger_lines ?? [],
    entryDate: transaction.date ?? transaction.created_at.slice(0, 10),
  })).filter((transaction) => transaction.lines.length > 0), [transactions])
  const filtered = useMemo(() => posted.filter((transaction) => {
    const contact = transaction.contact_id ? contacts[transaction.contact_id] ?? "" : ""
    const lineText = transaction.lines.map((line) => `${line.account_code} ${LEDGER_BY_CODE.get(line.account_code)?.name ?? ""}`).join(" ")
    const haystack = `${transaction.entryDate} ${transaction.type} ${transaction.description ?? ""} ${transaction.category ?? ""} ${contact} ${lineText} ${transaction.id}`
    return haystack.toLowerCase().includes(search.trim().toLowerCase())
  }), [posted, contacts, search])
  const debitTotal = filtered.reduce((sum, transaction) => sum + transaction.lines.reduce((total, line) => total + Number(line.debit || 0), 0), 0)
  const creditTotal = filtered.reduce((sum, transaction) => sum + transaction.lines.reduce((total, line) => total + Number(line.credit || 0), 0), 0)

  return <div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">General Ledger</h2><p className="mt-1 text-sm text-muted-foreground">Every posted transaction, with its automatic debit and credit entries.</p></div><div className="flex gap-2"><Link to={`/b/${bid}/transactions`} className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted">Manage transactions</Link><Button variant="outline" size="icon" aria-label="Refresh general ledger" onClick={() => void load()}><RefreshCw className="size-4" /></Button></div></div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><span>Could not load the general ledger: {error}</span><Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button></div>}

    <section aria-label="Ledger totals" className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Posted transactions</p><p className="mt-2 text-2xl font-bold tabular-nums">{loading ? "—" : filtered.length.toLocaleString()}</p></div>
      <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total debits</p><p className="mt-2 text-xl font-bold tabular-nums">{loading ? "—" : format(debitTotal)}</p></div>
      <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total credits</p><p className="mt-2 text-xl font-bold tabular-nums">{loading ? "—" : format(creditTotal)} <span className={`ml-1 text-xs ${Math.abs(debitTotal - creditTotal) < 0.01 ? "text-emerald-600" : "text-destructive"}`}>{loading ? "" : Math.abs(debitTotal - creditTotal) < 0.01 ? "Balanced" : "Check entries"}</span></p></div>
    </section>

    <div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search general ledger" placeholder="Search date, description, contact, or account" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} className="pl-9" /></div>

    {loading ? <div className="space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-muted" />)}</div> : filtered.length ? <div className="space-y-3">{filtered.map((transaction) => {
      const debit = transaction.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0)
      const credit = transaction.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0)
      const date = new Date(`${transaction.entryDate}T00:00:00`).toLocaleDateString()
      return <article key={transaction.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookText className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.description || transaction.category || (transaction.type === "opening" ? "Opening balances" : "Transaction")}</p><p className="mt-0.5 text-xs text-muted-foreground">{date} · {transaction.type === "opening" ? "Opening entry" : transaction.type} · Ref {transaction.id.slice(0, 8)}{transaction.correction_role ? ` · ${transaction.correction_role}` : ""}</p></div></div><div className="text-right text-xs text-muted-foreground">{transaction.contact_id && <p className="mb-1">{contacts[transaction.contact_id] ?? "Contact"}</p>}<p>{transaction.lines.length} posting line{transaction.lines.length !== 1 ? "s" : ""}</p></div></header>
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span>Account</span><span>Description</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div>
        <div className="divide-y divide-border">{transaction.lines.map((line, index) => <div key={`${transaction.id}-${index}`} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] sm:items-center sm:gap-3 sm:px-5"><div className="min-w-0"><span className="block truncate font-medium">{LEDGER_BY_CODE.get(line.account_code)?.name ?? line.account_code}</span><span className="block text-xs text-muted-foreground sm:hidden">{line.description || "Posting"}</span></div><span className="hidden truncate text-muted-foreground sm:block">{line.description || "—"}</span><span className="flex justify-between tabular-nums sm:block sm:text-right"><span className="text-xs text-muted-foreground sm:hidden">Debit</span>{Number(line.debit) ? format(Number(line.debit)) : "—"}</span><span className="flex justify-between tabular-nums sm:block sm:text-right"><span className="text-xs text-muted-foreground sm:hidden">Credit</span>{Number(line.credit) ? format(Number(line.credit)) : "—"}</span></div>)}</div>
        <footer className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-3 border-t border-border bg-muted/20 px-4 py-2.5 text-xs font-semibold sm:px-5"><span className="text-muted-foreground">Entry totals</span><span className="text-right tabular-nums">{format(debit)}</span><span className="text-right tabular-nums">{format(credit)}</span></footer>
      </article>
    })}</div> : <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><BookText className="mx-auto size-8 text-muted-foreground/50" /><h3 className="mt-3 font-semibold">{search ? "No matching entries" : "No posted entries yet"}</h3><p className="mt-1 text-sm text-muted-foreground">{search ? "Try another search term." : "When you record a transaction, its journal postings will appear here automatically."}</p></div>}
  </div>
}
