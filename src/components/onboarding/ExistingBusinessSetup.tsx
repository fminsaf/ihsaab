import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Loader2, Wallet, Landmark, Users, Briefcase, FileText, TrendingDown, Receipt } from "lucide-react";
import { AssetBalancePanels } from "./balances/AssetBalancePanels";
import { IncomeEquityPanels } from "./balances/IncomeEquityPanels";
import type { BalanceTab, BankAccount, DueContact, FixedAsset, IncomeStatementItem, LoanItem, OwnerShare } from "../../types/businessOnboarding";

interface ExistingBusinessSetupProps {
  businessName: string; currencySymbol: string;
  isEquationBalanced: boolean; difference: number; totalAssets: number; totalLiabPlusEquity: number;
  totalBankBalance: number; totalReceivables: number; totalAssetsValue: number; totalPayables: number; totalLoans: number; totalEquity: number;
  activeTab: BalanceTab; setActiveTab: Dispatch<SetStateAction<BalanceTab>>;
  cashOnHand: number; setCashOnHand: (value: number) => void; bankAccounts: BankAccount[]; setBankAccounts: Dispatch<SetStateAction<BankAccount[]>>;
  customerDues: DueContact[]; setCustomerDues: Dispatch<SetStateAction<DueContact[]>>; fixedAssets: FixedAsset[]; setFixedAssets: Dispatch<SetStateAction<FixedAsset[]>>;
  supplierDues: DueContact[]; setSupplierDues: Dispatch<SetStateAction<DueContact[]>>; loans: LoanItem[]; setLoans: Dispatch<SetStateAction<LoanItem[]>>;
  incomeItems: IncomeStatementItem[]; setIncomeItems: Dispatch<SetStateAction<IncomeStatementItem[]>>; totalYtdRevenue: number; totalYtdExpenses: number; netIncome: number;
  owners: OwnerShare[]; setOwners: Dispatch<SetStateAction<OwnerShare[]>>; totalShares: number; retainedEarnings: number; setRetainedEarnings: (value: number) => void;
  isSubmitting: boolean; onBack: () => void; onAutoBalance: () => void; onCreateBusiness: () => void;
}

export function ExistingBusinessSetup(props: ExistingBusinessSetupProps) {
  const { businessName, currencySymbol, isEquationBalanced, difference, totalAssets, totalLiabPlusEquity, totalBankBalance, totalReceivables, totalAssetsValue, totalPayables, totalLoans, totalEquity, activeTab, setActiveTab, cashOnHand, setCashOnHand, bankAccounts, setBankAccounts, customerDues, setCustomerDues, fixedAssets, setFixedAssets, supplierDues, setSupplierDues, loans, setLoans, incomeItems, setIncomeItems, totalYtdRevenue, totalYtdExpenses, netIncome, owners, setOwners, totalShares, retainedEarnings, setRetainedEarnings, isSubmitting, onBack, onAutoBalance, onCreateBusiness } = props;
  return (
                <div>
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Existing Balances for {businessName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Answer simple business facts. We handle the balance sheet & income statement automatically.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onBack()}
                    >
                      <span>Switch to Fresh Business</span>
                    </Button>
                  </div>

                  {/* Accounting Equation Real-Time Validator Bar */}
                  <div className="mb-4 rounded-2xl border border-border/80 bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-foreground">Fundamental Equation:</span>
                        <span className="font-mono text-muted-foreground">Assets = Liabilities + Equity (inc. Net Income)</span>
                      </div>

                      {isEquationBalanced ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          <span>Books Balanced ✓</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-bold text-rose-500">
                          <AlertCircle className="size-3.5" />
                          <span>Discrepancy: {currencySymbol}{Math.abs(difference).toLocaleString()}</span>
                        </span>
                      )}
                    </div>

                    {/* Equation Key Figures */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-border/60 bg-background p-2">
                        <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Assets
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {currencySymbol}{totalAssets.toLocaleString()}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-background p-2">
                        <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Liab + Total Equity
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">
                          {currencySymbol}{totalLiabPlusEquity.toLocaleString()}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-background p-2">
                        <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Net Discrepancy
                        </div>
                        <div
                          className={`mt-0.5 text-sm font-bold ${
                            isEquationBalanced ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          }`}
                        >
                          {currencySymbol}{difference.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Auto-Balance Helper */}
                    {!isEquationBalanced && difference !== 0 && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-3.5 py-2 text-xs">
                        <span className="text-muted-foreground text-[11px]">
                          One-click fix: Balance equation by setting Retained Earnings to absorb the difference.
                        </span>
                        <Button
                          type="button"
                          size="xs"
                          onClick={onAutoBalance}
                        >
                          Auto-Balance Now
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* PROMINENT TOP WARNING / STATUS BANNER (MOVED ABOVE FORM AS REQUESTED) */}
                  {!isEquationBalanced ? (
                    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">Books are not yet balanced: </span>
                        Total Assets ({currencySymbol}{totalAssets.toLocaleString()}) must equal Total Liabilities + Equity ({currencySymbol}{totalLiabPlusEquity.toLocaleString()}).
                        Current Discrepancy is {currencySymbol}{Math.abs(difference).toLocaleString()}.
                        <span className="block mt-1 text-muted-foreground">
                          You can click the <strong>"Auto-Balance Now"</strong> button above to automatically reconcile into Retained Earnings.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span className="font-semibold">Books are fully balanced!</span>
                      <span>Assets equal Liabilities + Equity. You are ready to create your business.</span>
                    </div>
                  )}

                  {/* Category Tabs */}
                  <div className="mb-4 flex flex-wrap gap-1.5 rounded-2xl bg-muted/60 p-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab("cash")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "cash"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Wallet className="size-3.5" />
                      <span>Cash & Bank ({currencySymbol}{(cashOnHand + totalBankBalance).toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("receivables")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "receivables"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileText className="size-3.5" />
                      <span>Customer Dues ({currencySymbol}{totalReceivables.toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("assets")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "assets"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Briefcase className="size-3.5" />
                      <span>Machinery & Assets ({currencySymbol}{totalAssetsValue.toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("payables")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "payables"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <TrendingDown className="size-3.5" />
                      <span>Supplier Bills ({currencySymbol}{totalPayables.toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("loans")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "loans"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Landmark className="size-3.5" />
                      <span>Loans ({currencySymbol}{totalLoans.toLocaleString()})</span>
                    </button>

                    {/* NEW: Income Statement Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("income")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "income"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Receipt className="size-3.5" />
                      <span>
                        Income Statement ({netIncome >= 0 ? "+" : "-"}{currencySymbol}{Math.abs(netIncome).toLocaleString()})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("equity")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                        activeTab === "equity"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Users className="size-3.5" />
                      <span>Owners & Equity ({currencySymbol}{totalEquity.toLocaleString()})</span>
                    </button>
                  </div>

                  {/* Tab Panels */}
                  <div className="rounded-2xl border border-border p-4 bg-background/50 min-h-[220px]">
                    <AssetBalancePanels activeTab={activeTab} currencySymbol={currencySymbol}
                      cashOnHand={cashOnHand} setCashOnHand={setCashOnHand}
                      bankAccounts={bankAccounts} setBankAccounts={setBankAccounts}
                      customerDues={customerDues} setCustomerDues={setCustomerDues}
                      fixedAssets={fixedAssets} setFixedAssets={setFixedAssets}
                      supplierDues={supplierDues} setSupplierDues={setSupplierDues}
                      loans={loans} setLoans={setLoans} />
                    <IncomeEquityPanels activeTab={activeTab} currencySymbol={currencySymbol}
                      incomeItems={incomeItems} setIncomeItems={setIncomeItems}
                      totalYtdRevenue={totalYtdRevenue} totalYtdExpenses={totalYtdExpenses} netIncome={netIncome}
                      owners={owners} setOwners={setOwners} totalShares={totalShares}
                      retainedEarnings={retainedEarnings} setRetainedEarnings={setRetainedEarnings} />
                  </div>

                  {/* Step 2 Bottom Actions - NO WARNING BELOW (MOVED PROMINENTLY ABOVE) */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => onBack()}
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back</span>
                    </Button>

                    <Button
                      type="button"
                      size="default"
                      disabled={!isEquationBalanced || isSubmitting}
                      onClick={onCreateBusiness}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Creating Business...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          <span>Create Business & Open Dashboard</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>  );
}
