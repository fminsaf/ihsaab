export type BalanceTab = "cash" | "receivables" | "assets" | "payables" | "loans" | "income" | "equity"

export interface BankAccount {
  id: string
  name: string
  balance: number
}

export interface DueContact {
  id: string
  contactName: string
  amount: number
}

export interface FixedAsset {
  id: string
  name: string
  boughtYear: number
  originalPrice: number
  currentValue: number
}

export interface LoanItem {
  id: string
  lenderName: string
  balance: number
  isLongTerm: boolean
}

export interface IncomeStatementItem {
  id: string
  name: string
  amount: number
  type: "revenue" | "expense"
}

export interface OwnerShare {
  id: string
  ownerName: string
  sharePercentage: number
  investedCapital: number
}
