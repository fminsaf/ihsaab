import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"
import { Plus } from "lucide-react"
import { useNewTransactionDialog } from "./useNewTransactionDialog"
import { TRANSACTION_TYPES, PAYMENT_METHODS, EXPENSE_CATEGORIES, type EntryAction, type PaymentMethod, type TransferDirection } from "../../data/transactionOptions"

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

interface NewTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  /** Called after a successful insert so the parent can refresh its list */
  onSuccess?: () => void
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  businessId,
  onSuccess,
}: NewTransactionDialogProps) {
  const {
    form, contacts, inventoryProducts, inventoryLines, addingContact, newContactName, saving,
    setInventoryLines, setAddingContact, setNewContactName, setField, handleTypeSelect, handleClose, handleSubmit,
    selectedTypeMeta, isInventoryAction, inventoryTotal, postingPreview,
  } = useNewTransactionDialog({ open, businessId, onOpenChange, onSuccess })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden p-0"
      >
        {/* ── Fixed header ─────────────────────────────────── */}
        <div className="border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>New transaction</DialogTitle>
            <DialogDescription>Choose what happened and enter the details. The app will post it to the fixed ledgers shown below.</DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <form
          id="new-transaction-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-6">

            {/* ── Section 1: Transaction type ─────────────── */}
            <section>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Transaction type
              </p>
              <Select value={form.action} onValueChange={(value) => handleTypeSelect(value as EntryAction)}>
                <SelectTrigger id="transaction-type" className="w-full">
                  <SelectValue>{selectedTypeMeta?.label ?? "Choose transaction type"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTypeMeta && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedTypeMeta.description}
                </p>
              )}
            </section>

            {/* ── Sections 2 & 3: Only shown after type is selected ── */}
            {form.action && (
              <>
                {/* ── Section 3: Type-specific details ────── */}
                <section>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {form.action === "sale"
                      ? "Sale details"
                      : form.action === "customer_payment"
                      ? "Payment details"
                      : form.action === "purchase"
                      ? "Purchase details"
                      : form.action === "stock_purchase"
                      ? "Stock purchase details"
                      : form.action === "asset_purchase"
                      ? "Asset purchase details"
                      : form.type === "income"
                      ? "Income details"
                      : form.type === "expense"
                      ? "Expense Details"
                      : "Transfer Details"}
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    {/* ── INCOME fields ─── */}
                    {(form.action === "sale" || form.action === "customer_payment") && (
                      <>
                        <div className="col-span-2 space-y-1.5">
                          <Label htmlFor="contact_id">Customer</Label>
                          <div className="flex items-center gap-2">
                            {addingContact ? (
                              <Input className="min-w-0 flex-1" aria-label="New customer name" autoFocus placeholder="New customer name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />
                            ) : (
                              <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                                <SelectTrigger id="contact_id" className="min-w-0 flex-1">
                                  <SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a customer"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {contacts.map((contact) => (
                                    <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => { setAddingContact((current) => !current); setField("contact_id", ""); setNewContactName("") }}>
                              {addingContact ? "Choose existing" : <><Plus className="size-4" /> Create customer</>}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">The customer name will be saved with this transaction.</p>
                        </div>
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="sale-payment-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="sale-payment-status" className="w-full"><SelectValue>{form.payment_status === "unpaid" ? "Customer owes me" : "Paid now"}</SelectValue></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">Customer owes me</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="invoice_number">Invoice Number</Label>
                          <Input
                            id="invoice_number"
                            type="text"
                            placeholder="e.g. INV-001"
                            value={form.invoice_number}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setField("invoice_number", e.target.value)
                            }
                          />
                        </div>}
                        {form.action === "sale" && <div className="space-y-1.5">
                          <Label htmlFor="sale-tax-amount">Tax amount</Label>
                          <Input id="sale-tax-amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.tax_reserved} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("tax_reserved", e.target.value)} />
                          <p className="text-xs text-muted-foreground">Added to the amount due.</p>
                        </div>}
                        {((form.action === "sale" && form.payment_status === "paid") || form.action === "customer_payment") && <div className="space-y-1.5">
                          <Label htmlFor="income_payment_method">Payment Method</Label>
                          <Select
                            value={form.payment_method}
                            onValueChange={(v) => setField("payment_method", v as PaymentMethod)}
                          >
                            <SelectTrigger id="income_payment_method" className="w-full">
                              <SelectValue>{PAYMENT_METHODS.find((method) => method.value === form.payment_method)?.label ?? "Select method"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>}
                      </>
                    )}

                    {/* ── EXPENSE fields ─── */}
                    {(form.type === "expense" && (form.action === "expense" || form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase")) && (
                      <>
                        <div className="col-span-2 space-y-1.5">
                          <Label htmlFor="vendor-contact">Vendor</Label>
                          <div className="flex items-center gap-2">
                            {addingContact ? (
                              <Input className="min-w-0 flex-1" aria-label="New vendor name" autoFocus placeholder="New vendor name" value={newContactName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewContactName(event.target.value)} />
                            ) : (
                              <Select value={form.contact_id} onValueChange={(v) => setField("contact_id", v)}>
                                <SelectTrigger id="vendor-contact" className="min-w-0 flex-1"><SelectValue>{contacts.find((contact) => contact.id === form.contact_id)?.name || "Choose a vendor"}</SelectValue></SelectTrigger>
                                <SelectContent>{contacts.map((contact) => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}</SelectContent>
                              </Select>
                            )}
                            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => { setAddingContact((current) => !current); setField("contact_id", ""); setNewContactName("") }}>
                              {addingContact ? "Choose existing" : <><Plus className="size-4" /> Create vendor</>}
                            </Button>
                          </div>
                        </div>
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase") && <div className="space-y-1.5">
                          <Label htmlFor="purchase-status">Payment status</Label>
                          <Select value={form.payment_status} onValueChange={(v) => setField("payment_status", v as "paid" | "unpaid")}>
                            <SelectTrigger id="purchase-status" className="w-full"><SelectValue>{form.payment_status === "unpaid" ? "I owe the vendor" : "Paid now"}</SelectValue></SelectTrigger>
                            <SelectContent><SelectItem value="paid">Paid now</SelectItem><SelectItem value="unpaid">I owe the vendor</SelectItem></SelectContent>
                          </Select>
                        </div>}
                        {(form.action === "purchase" || form.action === "stock_purchase" || form.action === "expense") && <div className="space-y-1.5">
                          <Label htmlFor="category">Category</Label>
                          <Select value={form.category} onValueChange={(value) => setField("category", value)}><SelectTrigger id="category" className="w-full"><SelectValue placeholder="Choose an expense category" /></SelectTrigger><SelectContent>{EXPENSE_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
                        </div>}
                        <div className="space-y-1.5">
                          <Label htmlFor="tax_reserved">Tax Amount</Label>
                          <Input
                            id="tax_reserved"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.tax_reserved}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setField("tax_reserved", e.target.value)
                            }
                          />
                        </div>
                        {(form.action !== "purchase" && form.action !== "stock_purchase" && form.action !== "asset_purchase" || form.payment_status === "paid") && <div className="space-y-1.5">
                          <Label htmlFor="expense_payment_method">Payment Method</Label>
                          <Select
                            value={form.payment_method}
                            onValueChange={(v) => setField("payment_method", v as PaymentMethod)}
                          >
                            <SelectTrigger id="expense_payment_method" className="w-full">
                              <SelectValue>{PAYMENT_METHODS.find((method) => method.value === form.payment_method)?.label ?? "Select method"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>}
                      </>
                    )}

                    {isInventoryAction && <div className="col-span-2 space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Inventory items</p><p className="text-xs text-muted-foreground">{form.action === "sale" ? "Sale quantity cannot exceed stock on hand." : "Purchased quantities are added to stock."}</p></div><Button type="button" variant="outline" size="sm" onClick={() => setInventoryLines((current) => [...current, { product_id: "", quantity: "1" }])}>Add item</Button></div>
                      {inventoryProducts.length === 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">No active inventory products found. Add products on the Inventory page first.</p>}
                      {inventoryLines.length === 0 && inventoryProducts.length > 0 && <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">Add an item to this transaction.</p>}
                      {inventoryLines.map((line, index) => {
                        const selected = inventoryProducts.find((product) => product.id === line.product_id)
                        const unitPrice = selected ? Number(form.action === "sale" ? selected.sale_price : selected.purchase_cost) : 0
                        const usedElsewhere = new Set(inventoryLines.filter((_, lineIndex) => lineIndex !== index).map((item) => item.product_id))
                        return <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2">
                          <div className="min-w-0 space-y-1.5"><Label htmlFor={`inventory-product-${index}`}>Product</Label><Select value={line.product_id} onValueChange={(value) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, product_id: value } : item))}><SelectTrigger id={`inventory-product-${index}`} className="w-full"><SelectValue>{selected ? `${selected.name}${selected.sku ? ` · ${selected.sku}` : ""}${form.action === "sale" ? ` · ${Number(selected.quantity_on_hand)} ${selected.unit} available` : ""}` : "Select product"}</SelectValue></SelectTrigger><SelectContent>{inventoryProducts.filter((product) => !usedElsewhere.has(product.id)).map((product) => <SelectItem key={product.id} value={product.id}>{product.name}{product.sku ? ` · ${product.sku}` : ""}{form.action === "sale" ? ` · ${Number(product.quantity_on_hand)} ${product.unit} available` : ""}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{selected ? `${unitPrice.toFixed(2)} per ${selected.unit}` : "Choose an item"}</p></div>
                          <div className="space-y-1.5"><Label htmlFor={`inventory-quantity-${index}`}>Qty</Label><Input id={`inventory-quantity-${index}`} type="number" min="0.001" step="0.001" max={form.action === "sale" && selected ? selected.quantity_on_hand : undefined} required value={line.quantity} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInventoryLines((current) => current.map((item, lineIndex) => lineIndex === index ? { ...item, quantity: event.target.value } : item))} /></div>
                          <Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={() => setInventoryLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}>×</Button>
                        </div>
                      })}
                    </div>}

                    {form.action === "transfer" && <div className="col-span-2 space-y-1.5"><Label htmlFor="transfer-direction">Transfer direction</Label><Select value={form.transfer_direction} onValueChange={(value) => setField("transfer_direction", value as TransferDirection)}><SelectTrigger id="transfer-direction" className="w-full"><SelectValue>{form.transfer_direction === "cash_to_bank" ? "Cash to bank" : "Bank to cash"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="cash_to_bank">Cash to bank</SelectItem><SelectItem value="bank_to_cash">Bank to cash</SelectItem></SelectContent></Select></div>}

                  </div>
                </section>

                {/* ── Common details (last) ───────────── */}
                <section>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Common Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">
                        Amount before tax <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={isInventoryAction ? inventoryTotal.toFixed(2) : form.amount}
                        readOnly={isInventoryAction}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("amount", e.target.value)
                        }
                        required={!isInventoryAction}
                      />
                      {isInventoryAction && <p className="text-xs text-muted-foreground">Calculated from the selected inventory items, before tax.</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label htmlFor="date">
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("date", e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        type="text"
                        placeholder="Brief note about this transaction…"
                        value={form.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setField("description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

              </>
            )}
          </div>
        </form>

        {/* ── Fixed footer ──────────────────────────────────── */}
        <div className="border-t border-border px-6 py-3">
          <section aria-label="Automatic double entry preview" className="mb-3 max-h-36 overflow-y-auto rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold">Automatic ledger posting</p><p className="text-[11px] text-muted-foreground">Fixed entries</p></div>
            <div className="space-y-1.5">{postingPreview.map((line, index) => <div key={`${line.ledger}-${line.side}-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs sm:text-sm"><span className="min-w-0 truncate">{line.ledger}</span><span className={`font-semibold uppercase ${line.side === "Debit" ? "text-blue-700 dark:text-blue-300" : "text-violet-700 dark:text-violet-300"}`}>{line.side}</span><span className="text-right tabular-nums">{line.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>)}</div>
          </section>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-transaction-form"
              disabled={!form.type || saving}
            >
              {saving ? "Saving…" : "Save transaction"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

