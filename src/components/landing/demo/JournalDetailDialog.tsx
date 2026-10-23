import { CheckCircle2, Sparkles } from "lucide-react"
import type { Transaction } from "../../../data/heroDemo"

interface JournalDetailDialogProps {
  transaction: Transaction | null
  onClose: () => void
}

export function JournalDetailDialog({ transaction, onClose }: JournalDetailDialogProps) {
  if (!transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h4 className="text-base font-bold">Ihsaab Automated Journal</h4>
          </div>
          <button type="button" onClick={onClose} aria-label="Close journal details" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">✕</button>
        </div>

        <div className="mt-4 space-y-3.5 text-sm">
          <p className="text-muted-foreground text-xs leading-relaxed">
            As an SMB owner, you only typed <span className="font-semibold text-foreground">"{transaction.description}"</span> for{" "}
            <span className="font-semibold text-foreground">${transaction.amount}</span>. Here is the double-entry journal Ihsaab created automatically:
          </p>
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
            <div className="flex justify-between font-mono"><span className="text-muted-foreground">DEBIT:</span><span className="font-semibold text-foreground">{transaction.journal.debitAccount} (+${transaction.amount})</span></div>
            <div className="flex justify-between font-mono"><span className="text-muted-foreground">CREDIT:</span><span className="font-semibold text-foreground">{transaction.journal.creditAccount} (+${transaction.amount})</span></div>
            <div className="flex justify-between font-mono pt-2 border-t border-border"><span className="text-muted-foreground">TAX PROVISION:</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">${transaction.journal.taxSegregated} segregated into Tax Reserve</span></div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Zero accounting jargon needed. Your CPA receives clean audit-ready books.</span>
          </div>
        </div>
        <div className="mt-5 text-right"><button type="button" onClick={onClose} className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Got it!</button></div>
      </div>
    </div>
  )
}
