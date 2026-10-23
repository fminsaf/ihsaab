import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { BookOpen, RefreshCw, Search, X } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { LEDGER_ACCOUNTS, type LedgerAccount } from "../../../lib/ledgerAccounts"

type Account = LedgerAccount
interface Entry { id: string; account_code: string; contact_id: string | null; entry_date: string; description: string | null; debit: number; credit: number }
interface PostingLine { account_code: string; debit: number; credit: number; description?: string | null }
interface TransactionPosting { id: string; contact_id: string | null; date: string | null; created_at: string; description: string | null; ledger_lines: PostingLine[] | null }
interface Context { bid: string; currentBusinessCurrency?: string }
const CATEGORY_ORDER = ["asset", "liability", "equity", "income", "expense"]

export default function LedgersPage() {
  const { bid, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const accounts: Account[] = LEDGER_ACCOUNTS
  const [entries, setEntries] = useState<Entry[]>([])
  const [contacts, setContacts] = useState<Record<string, string>>({})
  const [selectedId, setSelectedId] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const load = useCallback(async () => {
    setLoading(true)
    const [transactionResult, contactResult] = await Promise.all([
      supabase.from("transactions").select("id, contact_id, date, created_at, description, ledger_lines").eq("business_id", bid).order("date", { ascending: false }),
      supabase.from("contacts").select("id, name").eq("business_id", bid),
    ])
    const postings = (transactionResult.data ?? []) as TransactionPosting[]
    setEntries(postings.flatMap((transaction) => (transaction.ledger_lines ?? []).map((line, index) => ({
      id: `${transaction.id}-${index}`,
      account_code: line.account_code,
      contact_id: transaction.contact_id,
      entry_date: transaction.date ?? transaction.created_at.slice(0, 10),
      description: line.description || transaction.description,
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
    }))))
    setContacts(Object.fromEntries((contactResult.data ?? []).map((contact) => [contact.id, contact.name])))
    setError(transactionResult.error?.message ?? contactResult.error?.message ?? "")
    setLoading(false)
  }, [bid])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (selectedId && !accounts.some((account) => account.code === selectedId)) setSelectedId("")
  }, [accounts, selectedId])

  const filtered = useMemo(() => accounts.filter((account) => `${account.name} ${account.category}`.toLowerCase().includes(search.toLowerCase())), [accounts, search])
  const selected = accounts.find((account) => account.code === selectedId)
  const selectedEntries = entries.filter((entry) => entry.account_code === selectedId)
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency }).format(value)

  const accountTotals = (account: Account) => {
    const rows = entries.filter((entry) => entry.account_code === account.code)
    const debit = rows.reduce((sum, row) => sum + Number(row.debit), 0)
    const credit = rows.reduce((sum, row) => sum + Number(row.credit), 0)
    return { debit, credit, debitBalance: Math.max(0, debit - credit), creditBalance: Math.max(0, credit - debit) }
  }
  const trial = accounts.reduce((totals, account) => {
    const current = accountTotals(account)
    totals.debit += current.debitBalance
    totals.credit += current.creditBalance
    return totals
  }, { debit: 0, credit: 0 })
  const grouped = CATEGORY_ORDER.map((group) => ({ category: group, rows: filtered.filter((account) => (account.category).toLowerCase() === group) })).filter((group) => group.rows.length)

  return <div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-xl font-bold">Ledgers</h2><p className="mt-1 text-sm text-muted-foreground">Review every account, its debit and credit activity, and the trial balance.</p></div>
      <Button variant="outline" size="icon" aria-label="Refresh ledgers" onClick={() => void load()}><RefreshCw className="size-4" /></Button>
    </div>

    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load ledger data: {error}</p>}

    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Trial balance</h3><p className="text-xs text-muted-foreground">Opening balances and posted transaction activity</p></div><span className={`text-sm font-semibold ${Math.abs(trial.debit - trial.credit) < 0.01 ? "text-emerald-600" : "text-amber-600"}`}>{Math.abs(trial.debit - trial.credit) < 0.01 ? "Balanced" : "Out of balance"}</span></div>
      <div className="grid grid-cols-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><span>Account</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div>
      <div className="divide-y divide-border">{accounts.map((account) => { const total = accountTotals(account); return <button type="button" key={account.code} onClick={() => setSelectedId(account.code)} className="grid w-full grid-cols-3 py-2.5 text-left text-sm hover:bg-muted/40"><span className="truncate pr-2">{account.name}</span><span className="text-right tabular-nums">{total.debitBalance ? format(total.debitBalance) : "—"}</span><span className="text-right tabular-nums">{total.creditBalance ? format(total.creditBalance) : "—"}</span></button> })}</div>
      <div className="grid grid-cols-3 border-t border-border pt-3 text-sm font-bold"><span>Total</span><span className="text-right tabular-nums">{format(trial.debit)}</span><span className="text-right tabular-nums">{format(trial.credit)}</span></div>
    </section>

    <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)]">
      <section className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search ledgers" placeholder="Search ledgers" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} className="pl-9" /></div>
        {loading ? <div className="h-48 animate-pulse rounded-2xl bg-muted" /> : grouped.length ? grouped.map((group) => <div key={group.category} className="overflow-hidden rounded-2xl border border-border bg-card"><h3 className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.category} ledgers</h3><div className="divide-y divide-border">{group.rows.map((account) => { const totals = accountTotals(account); return <button type="button" key={account.code} onClick={() => setSelectedId(account.code)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${selectedId === account.code ? "bg-primary/5" : "hover:bg-muted/40"}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BookOpen className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{account.name}</span><span className="block text-xs text-muted-foreground">{totals.debitBalance ? `Dr ${format(totals.debitBalance)}` : totals.creditBalance ? `Cr ${format(totals.creditBalance)}` : "No balance"}</span></span></button> })}</div></div>) : <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No ledgers found.</div>}
      </section>

      <section className="min-h-72 overflow-hidden rounded-2xl border border-border bg-card">
        {selected ? <><div className="flex items-start justify-between border-b border-border p-4"><div><h3 className="font-semibold">{selected.name}</h3><p className="text-sm capitalize text-muted-foreground">{selected.category} ledger</p></div><Button variant="ghost" size="icon" aria-label="Close ledger details" onClick={() => setSelectedId("")}><X className="size-4" /></Button></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="bg-muted/30 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Description / contact</th><th className="px-4 py-3 text-right">Debit</th><th className="px-4 py-3 text-right">Credit</th></tr></thead><tbody className="divide-y divide-border">{selectedEntries.map((entry) => <tr key={entry.id}><td className="whitespace-nowrap px-4 py-3">{new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3">{entry.description || "Transaction"}{entry.contact_id && <span className="block text-xs text-muted-foreground">{contacts[entry.contact_id] ?? "Contact"}</span>}</td><td className="px-4 py-3 text-right tabular-nums">{Number(entry.debit) ? format(Number(entry.debit)) : "—"}</td><td className="px-4 py-3 text-right tabular-nums">{Number(entry.credit) ? format(Number(entry.credit)) : "—"}</td></tr>)}</tbody></table></div>{selectedEntries.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No transaction activity has been posted to this ledger.</p>}</> : <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><BookOpen className="size-9 text-muted-foreground/50" /><h3 className="mt-3 font-semibold">Select a ledger</h3><p className="mt-1 text-sm text-muted-foreground">Its debit and credit activity will appear here.</p></div>}
      </section>
    </div>

  </div>
}
