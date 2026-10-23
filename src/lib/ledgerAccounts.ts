export type LedgerCategory = "asset" | "liability" | "equity" | "income" | "expense"
export interface LedgerAccount { code: string; name: string; category: LedgerCategory }

// The chart of accounts is shared code. Only transaction posting lines are stored.
export const LEDGER_ACCOUNTS: LedgerAccount[] = [
  { code: "cash", name: "Cash on Hand", category: "asset" },
  { code: "bank", name: "Bank Accounts", category: "asset" },
  { code: "accounts_receivable", name: "Accounts Receivable (Customer Dues)", category: "asset" },
  { code: "inventory", name: "Inventory", category: "asset" },
  { code: "prepaid_expenses", name: "Prepaid Expenses", category: "asset" },
  { code: "property_plant_equipment", name: "Property, Plant & Equipment", category: "asset" },
  { code: "accumulated_depreciation", name: "Accumulated Depreciation", category: "asset" },
  { code: "input_tax_recoverable", name: "Input Tax Recoverable", category: "asset" },
  { code: "accounts_payable", name: "Accounts Payable (Supplier Dues)", category: "liability" },
  { code: "loans_payable", name: "Loans Payable", category: "liability" },
  { code: "taxes_payable", name: "Taxes Payable", category: "liability" },
  { code: "wages_payable", name: "Wages Payable", category: "liability" },
  { code: "customer_advances", name: "Customer Advances", category: "liability" },
  { code: "owners_equity", name: "Owner's Equity", category: "equity" },
  { code: "retained_earnings", name: "Retained Earnings", category: "equity" },
  { code: "owner_drawings", name: "Owner Drawings", category: "equity" },
  { code: "sales_revenue", name: "Sales Revenue", category: "income" },
  { code: "service_revenue", name: "Service Revenue", category: "income" },
  { code: "other_income", name: "Other Income", category: "income" },
  { code: "sales_returns", name: "Sales Returns & Allowances", category: "income" },
  { code: "cost_of_goods_sold", name: "Cost of Goods Sold", category: "expense" },
  { code: "advertising", name: "Advertising & Marketing", category: "expense" },
  { code: "bank_charges", name: "Bank Charges", category: "expense" },
  { code: "depreciation_expense", name: "Depreciation Expense", category: "expense" },
  { code: "utilities", name: "Electricity & Utilities", category: "expense" },
  { code: "insurance", name: "Insurance Expense", category: "expense" },
  { code: "interest_expense", name: "Interest Expense", category: "expense" },
  { code: "internet_telephone", name: "Internet & Telephone", category: "expense" },
  { code: "office_supplies", name: "Office Supplies", category: "expense" },
  { code: "rent", name: "Rent Expense", category: "expense" },
  { code: "repairs", name: "Repairs & Maintenance", category: "expense" },
  { code: "salaries", name: "Salaries & Wages", category: "expense" },
  { code: "taxes_licenses", name: "Taxes & Licenses", category: "expense" },
  { code: "transport", name: "Transport & Travel", category: "expense" },
  { code: "misc_expense", name: "Miscellaneous Expenses", category: "expense" },
]

export const LEDGER_BY_CODE = new Map(LEDGER_ACCOUNTS.map((account) => [account.code, account]))
const CREDIT_NORMAL_ACCOUNTS = new Set(["accumulated_depreciation"])
const DEBIT_NORMAL_ACCOUNTS = new Set(["owner_drawings", "sales_returns"])

export const normalDebit = (account: LedgerAccount) =>
  DEBIT_NORMAL_ACCOUNTS.has(account.code) ||
  (!CREDIT_NORMAL_ACCOUNTS.has(account.code) && (account.category === "asset" || account.category === "expense"))
