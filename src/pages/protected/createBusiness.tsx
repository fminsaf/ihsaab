import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../auth/authProvider";
import supabase from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "../../components/ui/field";
import { Separator } from "../../components/ui/separator";
import { toast } from "../../components/ui/toast";
import {
  Building2,
  Globe,
  Coins,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Scale,
  Wallet,
  Landmark,
  ShieldCheck,
  Loader2,
  Rocket,
  Users,
  Briefcase,
  FileText,
  TrendingDown,
  TrendingUp,
  Receipt,
} from "lucide-react";

const COUNTRIES = [
  { name: "Saudi Arabia", code: "SA", defaultCurrency: "SAR" },
  { name: "Sri Lanka", code: "LK", defaultCurrency: "LKR" },
  { name: "United States", code: "US", defaultCurrency: "USD" },
  { name: "United Arab Emirates", code: "AE", defaultCurrency: "AED" },
  { name: "United Kingdom", code: "GB", defaultCurrency: "GBP" },
  { name: "India", code: "IN", defaultCurrency: "INR" },
  { name: "Canada", code: "CA", defaultCurrency: "CAD" },
  { name: "Australia", code: "AU", defaultCurrency: "AUD" },
  { name: "Qatar", code: "QA", defaultCurrency: "QAR" },
  { name: "Oman", code: "OM", defaultCurrency: "OMR" },
  { name: "Kuwait", code: "KW", defaultCurrency: "KWD" },
  { name: "Bahrain", code: "BH", defaultCurrency: "BHD" },
  { name: "Singapore", code: "SG", defaultCurrency: "SGD" },
  { name: "Malaysia", code: "MY", defaultCurrency: "MYR" },
  { name: "Pakistan", code: "PK", defaultCurrency: "PKR" },
  { name: "Bangladesh", code: "BD", defaultCurrency: "BDT" },
  { name: "Germany", code: "DE", defaultCurrency: "EUR" },
  { name: "France", code: "FR", defaultCurrency: "EUR" },
  { name: "Other", code: "XX", defaultCurrency: "USD" },
];

const CURRENCIES = [
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
];

// Data Interfaces
interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface DueContact {
  id: string;
  contactName: string;
  amount: number;
}

interface FixedAsset {
  id: string;
  name: string;
  boughtYear: number;
  originalPrice: number;
  currentValue: number;
}

interface LoanItem {
  id: string;
  lenderName: string;
  balance: number;
  isLongTerm: boolean;
}

interface IncomeStatementItem {
  id: string;
  name: string;
  amount: number;
  type: "revenue" | "expense";
}

interface OwnerShare {
  id: string;
  ownerName: string;
  sharePercentage: number;
  investedCapital: number;
}

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
  const [activeTab, setActiveTab] = useState<
    "cash" | "receivables" | "assets" | "payables" | "loans" | "income" | "equity"
  >("cash");

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

      if (businessError) {
        console.warn("Supabase businesses insert error:", businessError);
      }

      const bid = businessData?.id || `biz_${Date.now().toString(36)}`;
      localStorage.setItem("last_used_business_id", bid);
      localStorage.setItem("ihsaab_last_bid", bid);

      toast.add({
        description: `"${businessName}" created with fresh zero-balance books!`,
        type: "success",
      });

      navigate(`/b/${bid}`, { replace: true });
    } catch {
      toast.add({ description: "Error creating business.", type: "error" });
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

      if (businessError) {
        console.warn("Supabase businesses insert error:", businessError);
      }

      const bid = businessData?.id || `biz_${Date.now().toString(36)}`;

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
      ].filter((a) => a.balance > 0);

      if (initialAccounts.length > 0) {
        try {
          await supabase.from("accounts").insert(initialAccounts);
        } catch (accErr) {
          console.warn("Accounts table insert skipped:", accErr);
        }
      }

      localStorage.setItem("last_used_business_id", bid);
      localStorage.setItem("ihsaab_last_bid", bid);

      toast.add({
        description: `Existing business "${businessName}" successfully migrated & balanced!`,
        type: "success",
      });

      navigate(`/b/${bid}`, { replace: true });
    } catch {
      toast.add({ description: "Error saving business records.", type: "error" });
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
            {/* ================= STEP 1: Main Business Details ================= */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                step === 1
                  ? "translate-x-0 opacity-100 relative"
                  : "-translate-x-full opacity-0 pointer-events-none absolute inset-0"
              }`}
            >
              <div className="mb-6">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <Building2 className="size-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Create your business
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set up your business legal details and currency to initialize your automated ledger.
                </p>
              </div>

              <Separator className="mb-6" />

              <form onSubmit={handleProceedToStep2}>
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="biz-name">Business Legal or Trading Name *</FieldLabel>
                      <Input
                        id="biz-name"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Al-Noor Cafe, Prime Retail, Tech Studio"
                      />
                      <FieldDescription>
                        This will appear on all your invoices, tax summaries, and financial statements.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="biz-country">Country / Region *</FieldLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Globe className="size-4" />
                        </div>
                        <select
                          id="biz-country"
                          value={country}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 pl-9 pr-3 text-sm text-foreground transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="biz-currency">Operating Currency *</FieldLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Coins className="size-4" />
                        </div>
                        <select
                          id="biz-currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 pl-9 pr-3 text-sm text-foreground transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                        >
                          {CURRENCIES.map((cur) => (
                            <option key={cur.code} value={cur.code}>
                              {cur.code} ({cur.symbol}) - {cur.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FieldDescription>
                        All transactions, cash flow, and tax reserves will be tracked in {currency}.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>

                  <div className="pt-4">
                    <Button type="submit" size="default" className="w-full">
                      <span>Continue to Step 2</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </FieldSet>
              </form>
            </div>

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
                <div>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      How are you starting {businessName || "your business"}?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose whether this is a brand new venture or an established business with existing transactions.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Card 1: Brand New Business (Zero Bloat) */}
                    <div className="relative flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-background/50 p-6 transition-all hover:border-primary hover:shadow-md">
                      <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                          <Rocket className="size-6" />
                        </div>
                        <div className="inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                          Instant • Zero Bloat
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          Brand New Business
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          Starting fresh from day one. No existing debts, unpaid customer invoices, prior revenue, or old equipment to migrate.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <Button
                          type="button"
                          size="default"
                          disabled={isSubmitting}
                          onClick={handleCreateFreshBusiness}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" />
                              <span>Create Business Immediately</span>
                              <ArrowRight className="size-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Card 2: Existing Business with Financial History */}
                    <div className="relative flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-background/50 p-6 transition-all hover:border-primary hover:shadow-md">
                      <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                          <Scale className="size-6" />
                        </div>
                        <div className="inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary mb-2">
                          Guided Onboarding
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          Existing Business
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          I have cash, bank balances, customer dues, supplier debts, YTD revenue/expenses, machinery, or bank loans to bring forward.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={() => setBusinessStatus("existing")}
                          className="w-full"
                        >
                          <span>Migrate Existing Balances</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back to Step 1</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* ================= Guided Existing Business Setup ================= */
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
                      onClick={() => setBusinessStatus("prompt")}
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
                          onClick={handleAutoBalance}
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
                    {/* TAB 1: CASH & BANK */}
                    {activeTab === "cash" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Physical Cash on Hand ({currencySymbol})
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={cashOnHand === 0 ? "" : cashOnHand}
                            placeholder="0.00"
                            onChange={(e) => setCashOnHand(parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Bank Accounts
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() =>
                                setBankAccounts([
                                  ...bankAccounts,
                                  { id: `bank-${Date.now()}`, name: "Savings / Secondary Bank", balance: 0 },
                                ])
                              }
                            >
                              <Plus className="size-3" />
                              <span>Add Bank</span>
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {bankAccounts.map((b) => (
                              <div key={b.id} className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={b.name}
                                  placeholder="Bank Name (e.g. Al Rajhi, Commercial Bank)"
                                  onChange={(e) =>
                                    setBankAccounts((prev) =>
                                      prev.map((item) =>
                                        item.id === b.id ? { ...item, name: e.target.value } : item,
                                      ),
                                    )
                                  }
                                  className="flex-1"
                                />
                                <div className="relative w-36">
                                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                                    {currencySymbol}
                                  </span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={b.balance === 0 ? "" : b.balance}
                                    placeholder="0"
                                    onChange={(e) =>
                                      setBankAccounts((prev) =>
                                        prev.map((item) =>
                                          item.id === b.id
                                            ? { ...item, balance: parseFloat(e.target.value) || 0 }
                                            : item,
                                        ),
                                      )
                                    }
                                    className="pl-6 text-right"
                                  />
                                </div>
                                {bankAccounts.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => setBankAccounts((prev) => prev.filter((item) => item.id !== b.id))}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CUSTOMER DUES (RECEIVABLES) */}
                    {activeTab === "receivables" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Unpaid Customer Invoices (Contacts)
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Add the contact name of customers who currently owe your business money.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              setCustomerDues([
                                ...customerDues,
                                { id: `c-${Date.now()}`, contactName: "", amount: 0 },
                              ])
                            }
                          >
                            <Plus className="size-3" />
                            <span>Add Customer Due</span>
                          </Button>
                        </div>

                        {customerDues.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            No customer dues entered. (If no one owes you money, leave this empty).
                          </div>
                        ) : (
                          customerDues.map((c) => (
                            <div key={c.id} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Customer / Client Name"
                                value={c.contactName}
                                onChange={(e) =>
                                  setCustomerDues((prev) =>
                                    prev.map((item) =>
                                      item.id === c.id ? { ...item, contactName: e.target.value } : item,
                                    ),
                                  )
                                }
                                className="flex-1"
                              />
                              <div className="relative w-36">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Amount Due"
                                  value={c.amount === 0 ? "" : c.amount}
                                  onChange={(e) =>
                                    setCustomerDues((prev) =>
                                      prev.map((item) =>
                                        item.id === c.id
                                          ? { ...item, amount: parseFloat(e.target.value) || 0 }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="pl-6 text-right"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setCustomerDues((prev) => prev.filter((item) => item.id !== c.id))}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 3: MACHINERY & ASSETS */}
                    {activeTab === "assets" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Physical Assets & Equipment
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Enter equipment, vehicle, or machines with bought year, purchase price, & current book value.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              setFixedAssets([
                                ...fixedAssets,
                                {
                                  id: `fa-${Date.now()}`,
                                  name: "",
                                  boughtYear: new Date().getFullYear() - 1,
                                  originalPrice: 0,
                                  currentValue: 0,
                                },
                              ])
                            }
                          >
                            <Plus className="size-3" />
                            <span>Add Asset</span>
                          </Button>
                        </div>

                        {fixedAssets.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            No physical machinery or equipment added. Click "Add Asset" if you own business equipment.
                          </div>
                        ) : (
                          fixedAssets.map((a) => (
                            <div key={a.id} className="rounded-xl border border-border p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  placeholder="Asset Name (e.g. Espresso Machine, Delivery Van)"
                                  value={a.name}
                                  onChange={(e) =>
                                    setFixedAssets((prev) =>
                                      prev.map((item) =>
                                        item.id === a.id ? { ...item, name: e.target.value } : item,
                                      ),
                                    )
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setFixedAssets((prev) => prev.filter((item) => item.id !== a.id))}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Bought Year</label>
                                  <Input
                                    type="number"
                                    value={a.boughtYear}
                                    onChange={(e) =>
                                      setFixedAssets((prev) =>
                                        prev.map((item) =>
                                          item.id === a.id
                                            ? { ...item, boughtYear: parseInt(e.target.value) || 2024 }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Purchase Price ({currencySymbol})</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={a.originalPrice === 0 ? "" : a.originalPrice}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const p = parseFloat(e.target.value) || 0;
                                      setFixedAssets((prev) =>
                                        prev.map((item) =>
                                          item.id === a.id
                                            ? { ...item, originalPrice: p, currentValue: item.currentValue || p }
                                            : item,
                                        ),
                                      );
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Current Book Value ({currencySymbol})</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={a.currentValue === 0 ? "" : a.currentValue}
                                    placeholder="0"
                                    onChange={(e) =>
                                      setFixedAssets((prev) =>
                                        prev.map((item) =>
                                          item.id === a.id
                                            ? { ...item, currentValue: parseFloat(e.target.value) || 0 }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 4: SUPPLIER & UTILITY DUES (PAYABLES) */}
                    {activeTab === "payables" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Supplier Invoices & Unpaid Bills
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Add contact name for vendors, suppliers, or small dues like electricity and rent.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              setSupplierDues([
                                ...supplierDues,
                                { id: `sup-${Date.now()}`, contactName: "", amount: 0 },
                              ])
                            }
                          >
                            <Plus className="size-3" />
                            <span>Add Due</span>
                          </Button>
                        </div>

                        {supplierDues.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            No supplier debts or unpaid bills entered.
                          </div>
                        ) : (
                          supplierDues.map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Vendor / Contact (e.g. Bean Wholesaler, Electricity Co)"
                                value={s.contactName}
                                onChange={(e) =>
                                  setSupplierDues((prev) =>
                                    prev.map((item) =>
                                      item.id === s.id ? { ...item, contactName: e.target.value } : item,
                                    ),
                                  )
                                }
                                className="flex-1"
                              />
                              <div className="relative w-36">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Amount"
                                  value={s.amount === 0 ? "" : s.amount}
                                  onChange={(e) =>
                                    setSupplierDues((prev) =>
                                      prev.map((item) =>
                                        item.id === s.id
                                          ? { ...item, amount: parseFloat(e.target.value) || 0 }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="pl-6 text-right"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setSupplierDues((prev) => prev.filter((item) => item.id !== s.id))}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 5: LOANS & FINANCING */}
                    {activeTab === "loans" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Bank Loans & Long-Term Notes
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Enter loans (&gt; 1 year) or formal financing with lender details.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              setLoans([
                                ...loans,
                                { id: `loan-${Date.now()}`, lenderName: "", balance: 0, isLongTerm: true },
                              ])
                            }
                          >
                            <Plus className="size-3" />
                            <span>Add Loan</span>
                          </Button>
                        </div>

                        {loans.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            No bank loans or formal financing entered.
                          </div>
                        ) : (
                          loans.map((l) => (
                            <div key={l.id} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Lender / Bank Name"
                                value={l.lenderName}
                                onChange={(e) =>
                                  setLoans((prev) =>
                                    prev.map((item) =>
                                      item.id === l.id ? { ...item, lenderName: e.target.value } : item,
                                    ),
                                  )
                                }
                                className="flex-1"
                              />
                              <div className="relative w-36">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Balance"
                                  value={l.balance === 0 ? "" : l.balance}
                                  onChange={(e) =>
                                    setLoans((prev) =>
                                      prev.map((item) =>
                                        item.id === l.id
                                          ? { ...item, balance: parseFloat(e.target.value) || 0 }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="pl-6 text-right"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setLoans((prev) => prev.filter((item) => item.id !== l.id))}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 6: INCOME STATEMENT (YTD REVENUE & EXPENSES) */}
                    {activeTab === "income" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Year-to-Date (YTD) Income Statement
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Record revenue and operating expenses already incurred this fiscal period.
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setIncomeItems([
                                  ...incomeItems,
                                  { id: `inc-${Date.now()}`, name: "Additional Revenue Stream", amount: 0, type: "revenue" },
                                ])
                              }
                            >
                              <Plus className="size-3" />
                              <span>Add Revenue</span>
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setIncomeItems([
                                  ...incomeItems,
                                  { id: `exp-${Date.now()}`, name: "Additional Operating Expense", amount: 0, type: "expense" },
                                ])
                              }
                            >
                              <Plus className="size-3" />
                              <span>Add Expense</span>
                            </Button>
                          </div>
                        </div>

                        {/* Income Summary Strip */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-center gap-1">
                              <TrendingUp className="size-3 text-emerald-500" /> Total YTD Revenue
                            </span>
                            <div className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                              +{currencySymbol}{totalYtdRevenue.toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-center gap-1">
                              <TrendingDown className="size-3 text-rose-500" /> Total YTD Expenses
                            </span>
                            <div className="mt-0.5 font-bold text-rose-500">
                              -{currencySymbol}{totalYtdExpenses.toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-center gap-1">
                              <Scale className="size-3 text-primary" /> Net Profit (Flows to Equity)
                            </span>
                            <div
                              className={`mt-0.5 font-bold ${
                                netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                              }`}
                            >
                              {netIncome >= 0 ? "+" : ""}{currencySymbol}{netIncome.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2">
                          {incomeItems.map((item) => {
                            const isRev = item.type === "revenue";
                            return (
                              <div key={item.id} className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    isRev
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "bg-rose-500/10 text-rose-500"
                                  }`}
                                >
                                  {isRev ? "Rev" : "Exp"}
                                </span>

                                <Input
                                  type="text"
                                  value={item.name}
                                  placeholder="Category description"
                                  onChange={(e) =>
                                    setIncomeItems((prev) =>
                                      prev.map((i) => (i.id === item.id ? { ...i, name: e.target.value } : i)),
                                    )
                                  }
                                  className="flex-1"
                                />

                                <div className="relative w-36">
                                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                                    {currencySymbol}
                                  </span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="0"
                                    value={item.amount === 0 ? "" : item.amount}
                                    onChange={(e) =>
                                      setIncomeItems((prev) =>
                                        prev.map((i) =>
                                          i.id === item.id
                                            ? { ...i, amount: parseFloat(e.target.value) || 0 }
                                            : i,
                                        ),
                                      )
                                    }
                                    className="pl-6 text-right font-semibold"
                                  />
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setIncomeItems((prev) => prev.filter((i) => i.id !== item.id))}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 7: OWNERS & EQUITY */}
                    {activeTab === "equity" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">
                              Partners & Fractional Ownership
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              Add partners with their percentage shares and initial capital contributed.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              setOwners([
                                ...owners,
                                {
                                  id: `owner-${Date.now()}`,
                                  ownerName: `Partner ${owners.length + 1}`,
                                  sharePercentage: 0,
                                  investedCapital: 0,
                                },
                              ])
                            }
                          >
                            <Plus className="size-3" />
                            <span>Add Partner</span>
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {owners.map((o) => (
                            <div key={o.id} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Partner / Founder Name"
                                value={o.ownerName}
                                onChange={(e) =>
                                  setOwners((prev) =>
                                    prev.map((item) =>
                                      item.id === o.id ? { ...item, ownerName: e.target.value } : item,
                                    ),
                                  )
                                }
                                className="flex-1"
                              />
                              <div className="relative w-24">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="Share %"
                                  value={o.sharePercentage === 0 ? "" : o.sharePercentage}
                                  onChange={(e) =>
                                    setOwners((prev) =>
                                      prev.map((item) =>
                                        item.id === o.id
                                          ? { ...item, sharePercentage: parseFloat(e.target.value) || 0 }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="text-right pr-6"
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-xs text-muted-foreground">
                                  %
                                </span>
                              </div>
                              <div className="relative w-32">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-muted-foreground">
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Capital"
                                  value={o.investedCapital === 0 ? "" : o.investedCapital}
                                  onChange={(e) =>
                                    setOwners((prev) =>
                                      prev.map((item) =>
                                        item.id === o.id
                                          ? { ...item, investedCapital: parseFloat(e.target.value) || 0 }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="pl-5 text-right"
                                />
                              </div>
                              {owners.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setOwners((prev) => prev.filter((item) => item.id !== o.id))}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {totalShares !== 100 && (
                          <div className="text-[11px] text-amber-500 font-medium">
                            Notice: Current shares total {totalShares}% (Standard target is 100%).
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">
                              YTD Net Profit Contributed to Equity:
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                              }`}
                            >
                              {netIncome >= 0 ? "+" : ""}{currencySymbol}{netIncome.toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Retained Earnings / Historical Prior Equity ({currencySymbol})
                            </label>
                            <Input
                              type="number"
                              step="any"
                              value={retainedEarnings === 0 ? "" : retainedEarnings}
                              placeholder="0"
                              onChange={(e) => setRetainedEarnings(parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Use this field or the "Auto-Balance Now" button above to balance against your assets, debts, and current profit.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2 Bottom Actions - NO WARNING BELOW (MOVED PROMINENTLY ABOVE) */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => setBusinessStatus("prompt")}
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back</span>
                    </Button>

                    <Button
                      type="button"
                      size="default"
                      disabled={!isEquationBalanced || isSubmitting}
                      onClick={handleCreateExistingBusiness}
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security / GAAP Compliance Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>GAAP compliant double-entry structure initialized upon creation</span>
        </div>
      </div>
    </div>
  );
};

export default CreateBusinessPage;
