import { useEffect, useState, type FormEvent } from "react";
import { EMPTY_FORM, TRANSACTION_TYPES, EXPENSE_CATEGORIES, type EntryAction, type FormState, type ContactOption, type InventoryProduct, type InventoryLine } from "../../data/transactionOptions";
import supabase from "../../lib/supabase";
import { toast } from "../ui/toast";

interface UseNewTransactionDialogOptions {
  open: boolean;
  businessId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function useNewTransactionDialog({ open, businessId, onOpenChange, onSuccess }: UseNewTransactionDialogOptions) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([])
  const [inventoryLines, setInventoryLines] = useState<InventoryLine[]>([])
  const [addingContact, setAddingContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [saving, setSaving] = useState(false)

  // Contacts are used by income and expense entries.
  useEffect(() => {
    if (!open || !businessId) return
    supabase.from("contacts").select("id, name").eq("business_id", businessId).order("name")
      .then(({ data }) => setContacts(data ?? []))
  }, [open, businessId])

  useEffect(() => {
    if (!open || !businessId || (form.action !== "sale" && form.action !== "stock_purchase")) return
    supabase.from("inventory_products")
      .select("id, name, sku, unit, quantity_on_hand, sale_price, purchase_cost, average_cost")
      .eq("business_id", businessId).eq("is_archived", false).order("name")
      .then(({ data, error }) => {
        if (error) toast.add({ description: "Failed to load inventory.", type: "error" })
        setInventoryProducts(data ?? [])
      })
  }, [open, businessId, form.action])

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTypeSelect(value: EntryAction) {
    const selectedAction = TRANSACTION_TYPES.find((item) => item.value === value)
    // Reset type-specific fields when switching
    setForm((prev) => ({
      ...EMPTY_FORM,
      date: prev.date,
      amount: prev.amount,
      description: prev.description,
      action: value,
      type: selectedAction?.transactionType ?? "",
    }))
    setInventoryLines([])
  }

  function handleClose() {
    if (saving) return
    setForm(EMPTY_FORM)
    setInventoryLines([])
    setAddingContact(false)
    setNewContactName("")
    onOpenChange(false)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    if (!form.type) {
      toast.add({ description: "Please select a transaction type.", type: "error" })
      return false
    }
    const amount = parseFloat(form.amount)
    const usesInventory = form.action === "sale" || form.action === "stock_purchase"
    if (!usesInventory && (!form.amount || isNaN(amount) || amount <= 0)) {
      toast.add({ description: "Please enter an amount greater than zero.", type: "error" })
      return false
    }
    if (usesInventory && (inventoryLines.length === 0 || inventoryLines.some((line) => !line.product_id || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0))) {
      toast.add({ description: "Add inventory items with a quantity greater than zero.", type: "error" })
      return false
    }
    if (form.action === "sale" && inventoryLines.some((line) => Number(line.quantity) > Number(inventoryProducts.find((product) => product.id === line.product_id)?.quantity_on_hand ?? 0))) {
      toast.add({ description: "A sale quantity cannot exceed the available stock.", type: "error" })
      return false
    }
    if (!form.date) {
      toast.add({ description: "Please select a date.", type: "error" })
      return false
    }
    if ((form.action === "sale" || form.action === "customer_payment") && !form.contact_id && !newContactName.trim()) {
      toast.add({ description: "Choose a customer or add a new one.", type: "error" })
      return false
    }
    if ((form.action === "purchase" || form.action === "stock_purchase" || form.action === "asset_purchase") && !form.contact_id && !newContactName.trim()) {
      toast.add({ description: "Choose a vendor or add a new one.", type: "error" })
      return false
    }
    if ((form.action === "purchase" || form.action === "expense") && !form.category) {
      toast.add({ description: "Choose an expense category.", type: "error" })
      return false
    }
    const tax = form.tax_reserved === "" ? 0 : Number(form.tax_reserved)
    if (form.action !== "transfer" && form.action !== "customer_payment" && (!Number.isFinite(tax) || tax < 0)) {
      toast.add({ description: "Enter a valid tax amount (0 or more).", type: "error" })
      return false
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast.add({ description: "You must be signed in to record a transaction.", type: "error" })
      setSaving(false)
      return
    }

    let contactId = form.contact_id || null
    if (addingContact && newContactName.trim()) {
      const { data: contact, error: contactError } = await supabase
        .from("contacts")
        .insert({ business_id: businessId, name: newContactName.trim() })
        .select("id")
        .single()
      if (contactError || !contact) {
        toast.add({ description: contactError?.message ?? "Could not create contact.", type: "error" })
        setSaving(false)
        return
      }
      contactId = contact.id
    }

    if (form.action === "sale" || form.action === "stock_purchase") {
      const { error } = await supabase.rpc("create_inventory_transaction", {
        p_business_id: businessId,
        p_action: form.action,
        p_date: form.date,
        p_description: form.description || null,
        p_contact_id: contactId,
        p_payment_status: form.payment_status,
        p_payment_method: form.payment_status === "paid" ? form.payment_method || null : null,
        p_tax_reserved: form.tax_reserved ? Number(form.tax_reserved) : 0,
        p_category: form.action === "stock_purchase" ? form.category || null : form.invoice_number || null,
        p_items: inventoryLines.map((line) => ({ product_id: line.product_id, quantity: Number(line.quantity) })),
        p_debit_account_id: null,
        p_credit_account_id: null,
      })
      setSaving(false)
      if (error) {
        toast.add({ description: error.message, type: "error" })
        return
      }
      toast.add({ description: "Inventory transaction created.", type: "success" })
      if (contactId && addingContact) setContacts((current) => [...current, { id: contactId!, name: newContactName.trim() }])
      setForm(EMPTY_FORM)
      setInventoryLines([])
      setAddingContact(false)
      setNewContactName("")
      onOpenChange(false)
      onSuccess?.()
      return
    }

    // Build type-specific payload — only include relevant columns
    const basePayload = {
      business_id: businessId,
      contact_id: contactId,
      date: form.date,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description || null,
    }

    let typePayload: Record<string, unknown> = {}

    if (form.action === "customer_payment") {
      typePayload = { category: `Customer payment${form.payment_method ? ` · ${form.payment_method}` : ""}`, tax_reserved: 0 }
    } else if (form.action === "purchase") {
      typePayload = {
        category: ["Purchase", form.payment_status === "paid" ? "Paid" : "Unpaid", form.category.trim(), form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_method : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.action === "asset_purchase") {
      typePayload = {
        category: ["Asset purchase", form.payment_status === "paid" ? "Paid" : "Unpaid", form.payment_status === "paid" && form.payment_method === "bank_transfer" ? form.payment_method : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.action === "service_income") {
      typePayload = {
        category: ["Service income", form.payment_status === "paid" ? "Paid" : "Unpaid", form.payment_status === "paid" && form.payment_method === "bank_transfer" ? "bank_transfer" : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.type === "income") {
      typePayload = {
        category: [
          form.customer ? `Customer: ${form.customer}` : form.invoice_number ? `Invoice: ${form.invoice_number}` : form.category || "Sale",
          form.payment_status === "paid" ? "Paid" : "Unpaid",
          form.payment_status === "paid" && form.payment_method === "bank_transfer" ? "bank_transfer" : "",
        ].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.type === "expense") {
      typePayload = {
        category: [form.category || "Other Expense", form.payment_method === "bank_transfer" ? "bank_transfer" : ""].filter(Boolean).join(" · "),
        tax_reserved: form.tax_reserved ? parseFloat(form.tax_reserved) : 0,
      }
    } else if (form.action === "transfer") {
      typePayload = {
        category: form.transfer_direction === "cash_to_bank" ? "Transfer · Cash to bank" : "Transfer · Bank to cash",
        tax_reserved: 0,
      }
    } else {
      typePayload = {
        category: null,
        tax_reserved: 0,
      }
    }

    const { error } = await supabase.from("transactions").insert({
      ...basePayload,
      ...typePayload,
    })

    setSaving(false)

    if (error) {
      toast.add({ description: error.message, type: "error" })
      return
    }

    toast.add({ description: "Transaction created.", type: "success" })
    if (contactId && addingContact) {
      setContacts((current) => [...current, { id: contactId!, name: newContactName.trim() }])
    }
    setForm(EMPTY_FORM)
    setAddingContact(false)
    setNewContactName("")
    onOpenChange(false)
    onSuccess?.()
  }

  const selectedTypeMeta = TRANSACTION_TYPES.find((t) => t.value === form.action)
  const isInventoryAction = form.action === "sale" || form.action === "stock_purchase"
  const inventoryTotal = inventoryLines.reduce((total, line) => {
    const product = inventoryProducts.find((item) => item.id === line.product_id)
    if (!product) return total
    const unitPrice = form.action === "sale" ? Number(product.sale_price) : Number(product.purchase_cost)
    return total + Math.round(Number(line.quantity || 0) * unitPrice * 100) / 100
  }, 0)
  const previewAmount = isInventoryAction ? inventoryTotal : Number(form.amount || 0)
  const taxAmount = Number(form.tax_reserved || 0)
  const grossAmount = previewAmount + taxAmount
  const paymentLedger = form.payment_method === "bank_transfer" ? "Bank Accounts" : "Cash on Hand"
  const expenseLedger = EXPENSE_CATEGORIES.includes(form.category) ? form.category : "Miscellaneous Expenses"
  const postingPreview: { ledger: string; side: "Debit" | "Credit"; amount: number }[] = []
  const addPosting = (ledger: string, side: "Debit" | "Credit", amount = previewAmount) => {
    postingPreview.push({ ledger, side, amount: Math.max(0, amount) })
  }
  const addTaxPosting = (ledger: string, side: "Debit" | "Credit") => {
    if (taxAmount > 0) addPosting(ledger, side, taxAmount)
  }

  if (form.action === "transfer") {
    const toBank = form.transfer_direction === "cash_to_bank"
    addPosting(toBank ? "Bank Accounts" : "Cash on Hand", "Debit")
    addPosting(toBank ? "Cash on Hand" : "Bank Accounts", "Credit")
  } else if (form.action === "sale") {
    addPosting(form.payment_status === "unpaid" ? "Accounts Receivable (Customer Dues)" : paymentLedger, "Debit", grossAmount)
    addPosting("Sales Revenue", "Credit")
    addTaxPosting("Taxes Payable", "Credit")
    const cost = inventoryLines.reduce((sum, line) => {
      const product = inventoryProducts.find((item) => item.id === line.product_id)
      return sum + Number(line.quantity || 0) * Number(product?.average_cost ?? product?.purchase_cost ?? 0)
    }, 0)
    if (inventoryLines.length > 0) {
      addPosting("Cost of Goods Sold", "Debit", cost)
      addPosting("Inventory", "Credit", cost)
    }
  } else if (form.action === "service_income") {
    addPosting(form.payment_status === "unpaid" ? "Accounts Receivable (Customer Dues)" : paymentLedger, "Debit", grossAmount)
    addPosting("Service Revenue", "Credit")
    addTaxPosting("Taxes Payable", "Credit")
  } else if (form.action === "customer_payment") {
    addPosting(paymentLedger, "Debit")
    addPosting("Accounts Receivable (Customer Dues)", "Credit")
  } else if (form.action === "stock_purchase") {
    addPosting("Inventory", "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  } else if (form.action === "asset_purchase") {
    addPosting("Property, Plant & Equipment", "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  } else if (form.type === "expense") {
    addPosting(expenseLedger, "Debit")
    addTaxPosting("Input Tax Recoverable", "Debit")
    addPosting(form.action === "purchase" && form.payment_status === "unpaid" ? "Accounts Payable (Supplier Dues)" : paymentLedger, "Credit", grossAmount)
  }


  return {
    form, contacts, inventoryProducts, inventoryLines, addingContact, newContactName, saving,
    setInventoryLines, setAddingContact, setNewContactName, setField, handleTypeSelect, handleClose, handleSubmit,
    selectedTypeMeta, isInventoryAction, inventoryTotal, postingPreview,
  };
}
