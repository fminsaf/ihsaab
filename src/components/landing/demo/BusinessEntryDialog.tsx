import { Plus } from "lucide-react"

type EntryType = "income" | "expense"

interface BusinessEntryDialogProps {
  open: boolean
  description: string
  amount: string
  type: EntryType
  category: string
  onDescriptionChange: (value: string) => void
  onAmountChange: (value: string) => void
  onTypeChange: (value: EntryType) => void
  onCategoryChange: (value: string) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

const incomeCategories = ["Direct Sales", "Services", "Catering", "Consulting"]
const expenseCategories = ["Supplies & Inventory", "Rent & Utilities", "Equipment & Repair", "Marketing & Ads"]

export function BusinessEntryDialog({
  open,
  description,
  amount,
  type,
  category,
  onDescriptionChange,
  onAmountChange,
  onTypeChange,
  onCategoryChange,
  onClose,
  onSubmit,
}: BusinessEntryDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary"><Plus className="size-4" /></div>
            <h4 className="text-base font-bold">Add Business Entry</h4>
          </div>
          <button type="button" onClick={onClose} aria-label="Close entry dialog" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">✕</button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Entry Type</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onTypeChange("income")} className={`rounded-2xl border py-2.5 text-xs font-bold transition ${type === "income" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border text-muted-foreground hover:bg-muted"}`}>+ Income / Sale</button>
              <button type="button" onClick={() => onTypeChange("expense")} className={`rounded-2xl border py-2.5 text-xs font-bold transition ${type === "expense" ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-border text-muted-foreground hover:bg-muted"}`}>- Expense / Bill</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">What happened?</label>
            <input type="text" required placeholder="e.g. Sold 20 ceramic mugs or Paid storefront rent" value={description} onChange={(event) => onDescriptionChange(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Amount ($)</label>
              <input type="number" step="any" required placeholder="250.00" value={amount} onChange={(event) => onAmountChange(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                {(type === "income" ? incomeCategories : expenseCategories).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 p-3.5 text-xs text-muted-foreground">💡 <span className="font-medium text-foreground">No accounting knowledge needed:</span> Ihsaab will automatically categorize this, update your cash flow, calculate profit margins, and segregate taxes.</div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Post Entry & Automate</button>
          </div>
        </form>
      </div>
    </div>
  )
}
