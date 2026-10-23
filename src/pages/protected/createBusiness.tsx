import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../auth/authProvider";
import { COUNTRIES, CURRENCIES } from "../../data/businessOptions";
import { BusinessDetailsStep } from "../../components/onboarding/BusinessDetailsStep";
import { BusinessStartChoice } from "../../components/onboarding/BusinessStartChoice";
import { ExistingBusinessSetup } from "../../components/onboarding/ExistingBusinessSetup";
import type { BalanceTab, BankAccount, DueContact, FixedAsset, LoanItem, IncomeStatementItem, OwnerShare } from "../../types/businessOnboarding";
import supabase from "../../lib/supabase";
import { toast } from "../../components/ui/toast";
import {
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const CreateBusinessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State: 1 = Business Details, 2 = Balances Onboarding
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Main Business Details
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("Saudi Arabia");
  const [currency, setCurrency] = useState("SAR");

  // Step 2 Decision: "prompt" | "existing"
  const [businessStatus, setBusinessStatus] = useState<"prompt" | "existing">("prompt");
  const [activeTab, setActiveTab] = useState<BalanceTab>("cash");

  // Step 2 Structured State for Existing Businesses:
  // 1. Cash & Bank
  const [cashOnHand, setCashOnHand] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: "bank-1", name: "Primary Business Bank", balance: 0 },
  ]);

  // 2. Customer Dues (Accounts Receivable)
  const [customerDues, setCustomerDues] = useState<DueContact[]>([]);

  // 3. Physical Assets (Equipment/Machines with year & purchase price)
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);

  // 4. Supplier & Utility Dues (Accounts Payable)
  const [supplierDues, setSupplierDues] = useState<DueContact[]>([]);

  // 5. Loans
  const [loans, setLoans] = useState<LoanItem[]>([]);

  // 6. Income Statement (YTD Revenue & Operating Expenses)
  const [incomeItems, setIncomeItems] = useState<IncomeStatementItem[]>([
    { id: "inc-1", name: "YTD Direct Sales & Service Revenue", amount: 0, type: "revenue" },
    { id: "exp-1", name: "YTD Cost of Goods & Supplies", amount: 0, type: "expense" },
    { id: "exp-2", name: "YTD Rent, Utilities & Overhead", amount: 0, type: "expense" },
    { id: "exp-3", name: "YTD Salaries & Contractor Pay", amount: 0, type: "expense" },
  ]);

  // 7. Owners & Equity (with fractional shares)
  const [owners, setOwners] = useState<OwnerShare[]>([
    { id: "owner-1", ownerName: "Founding Owner", sharePercentage: 100, investedCapital: 0 },
  ]);
  const [retainedEarnings, setRetainedEarnings] = useState<number>(0);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-switch currency when country changes
  const handleCountryChange = (cName: string) => {
    setCountry(cName);
    const found = COUNTRIES.find((c) => c.name === cName);
    if (found && found.defaultCurrency) {
      setCurrency(found.defaultCurrency);
    }
  };

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || currency;

  // Real-time Calculations:
  // Assets = Cash + Banks + Customer Dues + Fixed Assets
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalReceivables = customerDues.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalAssetsValue = fixedAssets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
  const totalAssets = (Number(cashOnHand) || 0) + totalBankBalance + totalReceivables + totalAssetsValue;

  // Liabilities = Supplier Dues + Loans
  const totalPayables = supplierDues.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalLoans = loans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0);
  const totalLiabilities = totalPayables + totalLoans;

  // Income Statement Totals: Net Income = YTD Revenue - YTD Expenses
  const totalYtdRevenue = incomeItems
    .filter((i) => i.type === "revenue")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalYtdExpenses = incomeItems
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const netIncome = totalYtdRevenue - totalYtdExpenses;

  // Total Equity = Invested Capital + Historical Retained Earnings + Current Year Net Income
  const totalOwnersCapital = owners.reduce((sum, o) => sum + (Number(o.investedCapital) || 0), 0);
  const totalEquity = totalOwnersCapital + (Number(retainedEarnings) || 0) + netIncome;

  const totalLiabPlusEquity = totalLiabilities + totalEquity;
  const difference = Math.round((totalAssets - totalLiabPlusEquity) * 100) / 100;
  const isEquationBalanced = Math.abs(difference) < 0.001;

  // Total share percentage check
  const totalShares = owners.reduce((sum, o) => sum + (Number(o.sharePercentage) || 0), 0);

  // 1-Click Auto-Balance: adjust Retained Earnings to bridge the gap
  const handleAutoBalance = () => {
    // Required Total Equity = Assets - Liabilities
    const requiredTotalEquity = totalAssets - totalLiabilities;
    // Current Equity without Retained Earnings = Owners Capital + Net Income
    const equityWithoutRetained = totalOwnersCapital + netIncome;
    const neededRetainedEarnings = requiredTotalEquity - equityWithoutRetained;

    setRetainedEarnings(Math.round(neededRetainedEarnings * 100) / 100);
    toast.add({
      description: `Books auto-balanced! Adjusted Retained Earnings to ${currencySymbol}${neededRetainedEarnings.toLocaleString()}.`,
      type: "success",
    });
  };

  // Step 1 Validation & Proceed
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.add({
        description: "Please enter your business name.",
        type: "error",
      });
      return;
    }
    setStep(2);
  };

  // Immediate creation for Brand New Businesses (Zero bloat)
  const handleCreateFreshBusiness = async () => {
    if (!user) {
      toast.add({ description: "Please sign in to create a business.", type: "error" });
      navigate("/auth/sign-in");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: businessName.trim(),
          country,
          currency,
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError || !businessData?.id) throw businessError ?? new Error("Business was not created.");

      const bid = businessData.id;
      localStorage.setItem("last_used_business_id", bid);
      localStorage.setItem("ihsaab_last_bid", bid);

      toast.add({
        description: `"${businessName}" created with fresh zero-balance books!`,
        type: "success",
      });

      navigate(`/b/${bid}`, { replace: true });
    } catch (error) {
      toast.add({ description: error instanceof Error ? error.message : "Error creating business.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submission for Existing Business Migration
  const handleCreateExistingBusiness = async () => {
    if (!isEquationBalanced) {
      toast.add({
        description: "Books must balance: Assets = Liabilities + Equity before saving.",
        type: "error",
      });
      return;
    }

    if (!user) {
      toast.add({ description: "Please sign in to proceed.", type: "error" });
      navigate("/auth/sign-in");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Business
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: businessName.trim(),
          country,
          currency,
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError || !businessData?.id) throw businessError ?? new Error("Business was not created.");

      const bid = businessData.id;

      // 2. Prepare Opening Chart of Accounts (Balance Sheet + Income Statement)
      const initialAccounts = [
        { business_id: bid, name: "Cash on Hand", category: "asset", balance: cashOnHand },
        ...bankAccounts.map((b) => ({
          business_id: bid,
          name: b.name || "Operating Bank",
          category: "asset",
          balance: b.balance,
        })),
        { business_id: bid, name: "Accounts Receivable (Customer Dues)", category: "asset", balance: totalReceivables },
        ...fixedAssets.map((f) => ({
          business_id: bid,
          name: `${f.name} (Bought ${f.boughtYear})`,
          category: "asset",
          balance: f.currentValue,
        })),
        { business_id: bid, name: "Accounts Payable (Supplier Dues)", category: "liability", balance: totalPayables },
        ...loans.map((l) => ({
          business_id: bid,
          name: `${l.lenderName} (${l.isLongTerm ? "Long Term Loan" : "Short Term Loan"})`,
          category: "liability",
          balance: l.balance,
        })),
        ...incomeItems.map((inc) => ({
          business_id: bid,
          name: inc.name,
          category: inc.type,
          balance: inc.amount,
        })),
        ...owners.map((o) => ({
          business_id: bid,
          name: `Capital: ${o.ownerName} (${o.sharePercentage}%)`,
          category: "equity",
          balance: o.investedCapital,
        })),
        { business_id: bid, name: "Retained Earnings / Historical Equity", category: "equity", balance: retainedEarnings },
      ].filter((a) => Number.isFinite(a.balance) && a.balance !== 0);

      const { error: chartError } = await supabase.rpc("initialize_business_opening", {
        p_business_id: bid,
        p_opening_balances: initialAccounts.map(({ name, category, balance }) => ({ name, category, balance })),
      });
      if (chartError) {
        await supabase.from("businesses").delete().eq("id", bid);
        throw chartError;
      }

      localStorage.setItem("last_used_business_id", bid);
      localStorage.setItem("ihsaab_last_bid", bid);

      toast.add({
        description: `Existing business "${businessName}" successfully migrated & balanced!`,
        type: "success",
      });

      navigate(`/b/${bid}`, { replace: true });
    } catch (error) {
      toast.add({ description: error instanceof Error ? error.message : "Error saving business records.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/10 via-emerald-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-3xl">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-foreground">
                Ihsaab
              </span>
              <span className="text-[10px] text-muted-foreground">
                Business Onboarding
              </span>
            </div>
          </Link>

          <span className="text-xs font-semibold text-muted-foreground">
            Step {step} of 2
          </span>
        </div>

        {/* Wizard Progress Bar */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-3xl border border-border bg-card p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
              step === 1
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                step === 1
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              1
            </div>
            <span>Business Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (businessName.trim()) setStep(2);
              else toast.add({ description: "Please enter business name first.", type: "error" });
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
              step === 2
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                step === 2
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              2
            </div>
            <span>Financial Balances</span>
          </button>
        </div>

        {/* Main Sliding Container */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="relative overflow-hidden">
            <BusinessDetailsStep
              step={step} businessName={businessName} setBusinessName={setBusinessName}
              country={country} currency={currency} onCountryChange={handleCountryChange}
              onCurrencyChange={setCurrency} onContinue={handleProceedToStep2}
            />

            {/* ================= STEP 2: Step 2 Prompt or Guided Migration ================= */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                step === 2
                  ? "translate-x-0 opacity-100 relative"
                  : "translate-x-full opacity-0 pointer-events-none absolute inset-0"
              }`}
            >
              {/* Option A & B Prompt: Is this a new or existing business? */}
              {businessStatus === "prompt" ? (
                <BusinessStartChoice businessName={businessName} isSubmitting={isSubmitting} onCreateFreshBusiness={handleCreateFreshBusiness} onChooseExisting={() => setBusinessStatus("existing")} onBack={() => setStep(1)} />
              ) : (
              <ExistingBusinessSetup
                businessName={businessName} currencySymbol={currencySymbol} isEquationBalanced={isEquationBalanced}
                difference={difference} totalAssets={totalAssets} totalLiabPlusEquity={totalLiabPlusEquity}
                totalBankBalance={totalBankBalance} totalReceivables={totalReceivables} totalAssetsValue={totalAssetsValue}
                totalPayables={totalPayables} totalLoans={totalLoans} totalEquity={totalEquity}
                activeTab={activeTab} setActiveTab={setActiveTab} cashOnHand={cashOnHand} setCashOnHand={setCashOnHand}
                bankAccounts={bankAccounts} setBankAccounts={setBankAccounts} customerDues={customerDues} setCustomerDues={setCustomerDues}
                fixedAssets={fixedAssets} setFixedAssets={setFixedAssets} supplierDues={supplierDues} setSupplierDues={setSupplierDues}
                loans={loans} setLoans={setLoans} incomeItems={incomeItems} setIncomeItems={setIncomeItems}
                totalYtdRevenue={totalYtdRevenue} totalYtdExpenses={totalYtdExpenses} netIncome={netIncome}
                owners={owners} setOwners={setOwners} totalShares={totalShares} retainedEarnings={retainedEarnings} setRetainedEarnings={setRetainedEarnings}
                isSubmitting={isSubmitting} onBack={() => setBusinessStatus("prompt")} onAutoBalance={handleAutoBalance}
                onCreateBusiness={handleCreateExistingBusiness}
              />
              )}
            </div>
          </div>
        </div>

        {/* Bookkeeping setup note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Opening balances are posted to your books when setup is complete</span>
        </div>
      </div>
    </div>
  );
};

export default CreateBusinessPage;
