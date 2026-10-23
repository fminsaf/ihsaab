import type { Dispatch, SetStateAction } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import type { DueContact } from "../../../types/businessOnboarding"

interface ContactDuesPanelProps {
  rows: DueContact[]
  setRows: Dispatch<SetStateAction<DueContact[]>>
  currencySymbol: string
  idPrefix: string
  title: string
  description: string
  addLabel: string
  emptyMessage: string
  namePlaceholder: string
  amountPlaceholder: string
}

export function ContactDuesPanel({
  rows,
  setRows,
  currencySymbol,
  idPrefix,
  title,
  description,
  addLabel,
  emptyMessage,
  namePlaceholder,
  amountPlaceholder,
}: ContactDuesPanelProps) {
  function addRow() {
    setRows((current) => [...current, { id: `${idPrefix}-${Date.now()}`, contactName: "", amount: 0 }])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground">{title}</h4>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        <Button type="button" size="xs" variant="outline" onClick={addRow}>
          <Plus className="size-3" />
          <span>{addLabel}</span>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">{emptyMessage}</div>
      ) : rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={namePlaceholder}
            value={row.contactName}
            onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, contactName: event.target.value } : item))}
            className="flex-1"
          />
          <div className="relative w-36">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">{currencySymbol}</span>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder={amountPlaceholder}
              value={row.amount === 0 ? "" : row.amount}
              onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, amount: parseFloat(event.target.value) || 0 } : item))}
              className="pl-6 text-right"
            />
          </div>
          <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${title.toLowerCase()} row`} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
