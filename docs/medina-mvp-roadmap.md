# Madinah MVP: retail bookkeeping

## Target customer
A single-location retailer in Madinah (initially perfume, dates, or gift shops), run by an owner with 1–3 employees. The product promise is: **know your real profit and keep your books in order**.

## MVP scope
1. Arabic-first dashboard with an English option, correct RTL, Saudi Riyal (SAR) defaults for new businesses, and Saudi locale formatting.
2. Business setup and opening balances, without silently changing the currency of existing businesses with historical transactions.
3. Contacts for customers and suppliers.
4. Products, units, stock movement, purchase cost, selling price, inventory valuation, and low-stock awareness.
5. Daily entries for sales, purchases, expenses, customer receipts, supplier payments, transfers, and supported returns/corrections.
6. Double-entry ledger with balanced postings, controlled reversals/corrections, audit history, and business-level ownership checks.
7. Reports: profit and loss, balance sheet, trial balance, general ledger, cash/bank balances, receivables/payables, stock valuation, and VAT summary.
8. Backup/recovery and clear error states before inviting merchants to use production data.

## Release gates
- Every posted transaction balances: total debits equal total credits.
- Inventory quantity and value reconcile to purchases, sales, returns, and adjustments.
- Customer/supplier balances reconcile to the relevant ledger control accounts.
- Reports reconcile to a known, independently calculated test dataset.
- Corrections preserve history and do not double-count revenue, VAT, or cost of goods sold.
- RTL, keyboard navigation, mobile layout, and mixed Arabic/Latin financial identifiers are checked on actual screens.
- RLS and cross-business ownership are tested; migrations are applied through the normal reviewed process.

## Saudi compliance status
**ZATCA e-invoicing compliance is not verified by this MVP branch.** Arabic UI, SAR formatting, or generating a PDF does not establish compliance. Before claiming compliance, identify each pilot taxpayer's obligations and implement/test the applicable tax invoice fields, invoice types, QR/storage rules, credit/debit note behavior, and Phase 2 integration/onboarding where applicable against current ZATCA specifications. Obtain Saudi tax/accounting review. Do not submit fabricated or production invoices during development.

VAT calculations must support applicable tax treatments and eligibility rules; do not assume every purchase has recoverable input VAT or every sale is standard-rated. Zakat and other reporting obligations require a separately defined scope and qualified review.

## Merchant discovery before expanding scope
Interview 10–15 Madinah shop owners and 2–3 Saudi accountants/bookkeepers. Observe their current month-end workflow and ask:
- How do they calculate last month's profit, including stock cost?
- How do they record cash/credit sales, supplier bills, returns, and customer debts?
- What POS/accounting tools do they use, and what causes them to switch?
- Which products need variants, units, expiry dates, barcodes, or batches?
- What reports do their accountant and ZATCA workflows require?
- Will they pilot with real workflows, and what price would they pay?

Continue investment only after several owners independently identify the same pain, at least three agree to pilot, and at least two show credible willingness to pay.

## Explicitly out of scope initially
Payroll, HR, manufacturing, advanced multi-warehouse, multi-company consolidation, and a full POS terminal unless discovery demonstrates a must-have need.
