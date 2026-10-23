import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router"
import { BookOpen, RefreshCw, Search } from "lucide-react"
import supabase from "../../../lib/supabase"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { LEDGER_ACCOUNTS, normalDebit, type LedgerAccount } from "../../../lib/ledgerAccounts"
import { fetchAllRows } from "../../../lib/fetchAllRows"

type Account = LedgerAccount
interface Entry { id: string; account_code: string; contact_id: string | null; entry_date: string; description: string | null; debit: number; credit: number }
interface PostingLine { account_code: string; debit: number; credit: number; description?: string | null }
interface TransactionPosting { id: string; contact_id: string | null; date: string | null; created_at: string; description: string | null; ledger_lines: PostingLine[] | null }
interface Context { bid: string; currentBusinessCurrency?: string }
const CATEGORY_ORDER = ["asset", "liability", "equity", "income", "expense"]

export default function LedgersPage() {
  const { bid, currentBusinessCurrency = "USD" } = useOutletContext<Context>()
  const [entries, setEntries] = useState<Entry[]>([])
  const [contacts, setContacts] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Account | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const accounts: Account[] = LEDGER_ACCOUNTS

  const load = useCallback(async () => {
    setLoading(true)
    const [transactionResult, contactResult] = await Promise.all([
      fetchAllRows((from, to) => supabase.from("transactions").select("id, contact_id, date, created_at, description, ledger_lines").eq("business_id", bid).order("date", { ascending: false }).range(from, to)),
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

  const filtered = useMemo(() => accounts.filter((account) => `${account.name} ${account.category} ${account.code}`.toLowerCase().includes(search.trim().toLowerCase())), [accounts, search])
  const selectedEntries = selected ? entries.filter((entry) => entry.account_code === selected.code) : []
  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: currentBusinessCurrency }).format(value)
  const accountTotals = (account: Account) => {
    const rows = entries.filter((entry) => entry.account_code === account.code)
    const debit = rows.reduce((sum, row) => sum + row.debit, 0)
    const credit = rows.reduce((sum, row) => sum + row.credit, 0)
    const net = debit - credit
    return { debit, credit, debitBalance: Math.max(net, 0), creditBalance: Math.max(-net, 0) }
  }
  const groups = CATEGORY_ORDER.map((category) => ({ category, rows: filtered.filter((account) => account.category.toLowerCase() === category) })).filter((group) => group.rows.length)

  return <div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-xl font-bold">Ledgers</h2><p className="mt-1 text-sm text-muted-foreground">Each account is shown as a debit and credit T-account. Select one to view its full activity.</p></div>
      <Button variant="outline" size="icon" aria-label="Refresh ledgers" onClick={() => void load()}><RefreshCw className="size-4" /></Button>
    </div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load ledger data: {error}</p>}
    <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search ledgers" placeholder="Search ledgers" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} className="pl-9" /></div>

    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-muted" />)}</div> : groups.length ? groups.map((group) => <section key={group.category} className="space-y-3"><h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.category} ledgers</h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{group.rows.map((account) => {
      const totals = accountTotals(account)
      const debitIsBalanceSide = normalDebit(account)
      const balance = debitIsBalanceSide ? totals.debitBalance || totals.creditBalance : totals.creditBalance || totals.debitBalance
      const balanceSide = totals.debitBalance ? "debit" : totals.creditBalance ? "credit" : debitIsBalanceSide ? "debit" : "credit"
      return <button key={account.code} type="button" onClick={() => setSelected(account)} className="group rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="mb-4 flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BookOpen className="size-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{account.name}</span><span className="block text-xs capitalize text-muted-foreground">{account.category}</span></span></div><span className="shrink-0 text-xs font-semibold text-muted-foreground">{balanceSide === "debit" ? "Dr balance" : "Cr balance"}</span></div>
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border"><div className="border-r border-border"><div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debit</div><div className="min-h-10 px-3 py-2 text-sm tabular-nums">{totals.debit ? format(totals.debit) : "—"}</div></div><div><div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credit</div><div className="min-h-10 px-3 py-2 text-sm tabular-nums">{totals.credit ? format(totals.credit) : "—"}</div></div></div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs"><span className="text-muted-foreground">Balance</span><span className="font-semibold tabular-nums">{balance ? format(balance) : format(0)} <span className="text-muted-foreground">{balanceSide === "debit" ? "Dr" : "Cr"}</span></span></div>
      </button>
    })}</div></section>) : <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No ledgers match your search.</div>}

    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{selected?.name ?? "Ledger activity"}</DialogTitle><DialogDescription className="capitalize">{selected?.category} ledger · full debit and credit transaction history</DialogDescription></DialogHeader>
        {selected && <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-3 text-sm"><div><span className="block text-xs font-medium uppercase text-muted-foreground">Total debit</span><span className="font-semibold tabular-nums">{format(accountTotals(selected).debit)}</span></div><div><span className="block text-xs font-medium uppercase text-muted-foreground">Total credit</span><span className="font-semibold tabular-nums">{format(accountTotals(selected).credit)}</span></div></div>
          <div className="hidden grid-cols-[100px_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-3 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span>Date</span><span>Description / contact</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div>
          {selectedEntries.length ? <div className="divide-y divide-border">{selectedEntries.map((entry) => <div key={entry.id} className="grid gap-2 px-3 py-3 text-sm sm:grid-cols-[100px_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] sm:items-center sm:gap-3"><div className="text-xs text-muted-foreground">{new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString()}</div><div className="min-w-0">{entry.description || "Transaction"}{entry.contact_id && <span className="block truncate text-xs text-muted-foreground">{contacts[entry.contact_id] ?? "Contact"}</span>}<div className="mt-2 grid grid-cols-2 rounded-lg border border-border sm:hidden"><div className="border-r border-border"><div className="bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Debit</div><div className="px-2 py-1.5 tabular-nums">{entry.debit ? format(entry.debit) : "—"}</div></div><div><div className="bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Credit</div><div className="px-2 py-1.5 tabular-nums">{entry.credit ? format(entry.credit) : "—"}</div></div></div></div><span className="hidden text-right tabular-nums sm:block">{entry.debit ? format(entry.debit) : "—"}</span><span className="hidden text-right tabular-nums sm:block">{entry.credit ? format(entry.credit) : "—"}</span></div>)}</div> : <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No transaction activity has been posted to this ledger.</p>}
        </div>}
      </DialogContent>
    </Dialog>
  </div>
}
