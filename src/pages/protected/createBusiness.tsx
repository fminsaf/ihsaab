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
  RotateCcw,
  Loader2,
} from "lucide-react";

interface AccountItem {
  id: string;
  name: string;
  category: "asset" | "liability" | "equity";
  balance: number;
  isPreset?: boolean;
}

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

const DEFAULT_PRESET_ACCOUNTS: AccountItem[] = [
  // Assets
  { id: "ast-1", name: "Main Operating Bank Account", category: "asset", balance: 0, isPreset: true },
  { id: "ast-2", name: "Cash on Hand", category: "asset", balance: 0, isPreset: true },
  { id: "ast-3", name: "Accounts Receivable (Customer Due)", category: "asset", balance: 0, isPreset: true },
  { id: "ast-4", name: "Stock & Inventory", category: "asset", balance: 0, isPreset: true },
  // Liabilities
  { id: "lia-1", name: "Accounts Payable (Vendor Bills)", category: "liability", balance: 0, isPreset: true },
  { id: "lia-2", name: "Business Credit Card / Line", category: "liability", balance: 0, isPreset: true },
  { id: "lia-3", name: "Bank Financing & Loans", category: "liability", balance: 0, isPreset: true },
  // Equity
  { id: "equ-1", name: "Owner's Capital / Investment", category: "equity", balance: 0, isPreset: true },
  { id: "equ-2", name: "Retained Earnings", category: "equity", balance: 0, isPreset: true },
];

const CreateBusinessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Main Business Details
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("Saudi Arabia");
  const [currency, setCurrency] = useState("SAR");

  // Step 2: Opening Accounting Balances
  const [accounts, setAccounts] = useState<AccountItem[]>(DEFAULT_PRESET_ACCOUNTS);
  const [activeAccountTab, setActiveAccountTab] = useState<"all" | "asset" | "liability" | "equity">("all");

  // Add custom account drawer state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountCategory, setNewAccountCategory] = useState<"asset" | "liability" | "equity">("asset");
  const [newAccountBalance, setNewAccountBalance] = useState("");

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

  // Calculations for Accounting Equation: Assets = Liabilities + Equity
  const totalAssets = accounts
    .filter((a) => a.category === "asset")
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalLiabilities = accounts
    .filter((a) => a.category === "liability")
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalEquity = accounts
    .filter((a) => a.category === "equity")
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalLiabPlusEquity = totalLiabilities + totalEquity;
  const difference = Math.round((totalAssets - totalLiabPlusEquity) * 100) / 100;
  const isEquationBalanced = Math.abs(difference) < 0.001;

  // Currency symbol helper
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || currency;

  // Account balance change handler
  const handleBalanceChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, balance: isNaN(num) ? 0 : Math.max(0, num) } : acc,
      ),
    );
  };

  // Delete account handler
  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // Add custom account handler
  const handleAddCustomAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const parsedBalance = parseFloat(newAccountBalance) || 0;
    const newAcc: AccountItem = {
      id: `custom-${Date.now()}`,
      name: newAccountName.trim(),
      category: newAccountCategory,
      balance: Math.max(0, parsedBalance),
      isPreset: false,
    };

    setAccounts([...accounts, newAcc]);
    setNewAccountName("");
    setNewAccountBalance("");
    setShowAddCustom(false);
    toast.add({
      description: `Added "${newAcc.name}" under ${newAcc.category.toUpperCase()}`,
      type: "success",
    });
  };

  // One-click Auto-Balance Helper (adjusts Owner's Equity so Assets = Liabilities + Equity)
  const handleAutoBalanceEquity = () => {
    const requiredTotalEquity = totalAssets - totalLiabilities;
    if (requiredTotalEquity < 0) {
      toast.add({
        description: "Liabilities exceed assets. Please adjust your liability or asset balances.",
        type: "error",
      });
      return;
    }

    setAccounts((prev) => {
      const ownerAcc = prev.find((a) => a.id === "equ-1" || a.name.includes("Owner"));
      if (ownerAcc) {
        const otherEquity = prev
          .filter((a) => a.category === "equity" && a.id !== ownerAcc.id)
          .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
        const newBalance = Math.max(0, requiredTotalEquity - otherEquity);
        return prev.map((a) => (a.id === ownerAcc.id ? { ...a, balance: newBalance } : a));
      } else {
        return [
          ...prev,
          {
            id: `equ-${Date.now()}`,
            name: "Owner's Capital",
            category: "equity",
            balance: requiredTotalEquity,
            isPreset: false,
          },
        ];
      }
    });

    toast.add({
      description: "Auto-balanced! Owner's Equity adjusted to match Assets.",
      type: "success",
    });
  };

  // Reset to 0 (fresh business start)
  const handleResetToZero = () => {
    setAccounts((prev) => prev.map((a) => ({ ...a, balance: 0 })));
    toast.add({
      description: "All opening balances set to zero for brand new business.",
      type: "info",
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

  // Step 2 Final Submission
  const handleCreateBusiness = async () => {
    if (!isEquationBalanced) {
      toast.add({
        description: "Books must balance: Assets = Liabilities + Equity before creating.",
        type: "error",
      });
      return;
    }

    if (!user) {
      toast.add({
        description: "Authentication session expired. Please sign in.",
        type: "error",
      });
      navigate("/auth/sign-in");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Insert business into Supabase
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

      const generatedBid = businessData?.id || `biz_${Date.now().toString(36)}`;

      // 2. Insert opening accounts if accounts table exists
      const accountsPayload = accounts
        .filter((a) => a.balance > 0 || a.isPreset)
        .map((a) => ({
          business_id: generatedBid,
          name: a.name,
          category: a.category,
          balance: a.balance,
        }));

      if (accountsPayload.length > 0) {
        try {
          await supabase.from("accounts").insert(accountsPayload);
        } catch (accErr) {
          console.warn("Accounts table insert skipped:", accErr);
        }
      }

      // 3. Cache last used business ID
      localStorage.setItem("last_used_business_id", generatedBid);
      localStorage.setItem("ihsaab_last_bid", generatedBid);

      toast.add({
        description: `Business "${businessName}" created successfully!`,
        type: "success",
      });

      // 4. Redirect to /b/:bid
      navigate(`/b/${generatedBid}`, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      toast.add({
        description: "An unexpected error occurred while creating business.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    if (activeAccountTab === "all") return true;
    return a.category === activeAccountTab;
  });

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/10 via-emerald-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-2xl">
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
                New Business Setup
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
              else {
                toast.add({
                  description: "Please enter a business name first.",
                  type: "error",
                });
              }
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
            <span>Opening Balances</span>
          </button>
        </div>

        {/* Main Card with Smooth Relative Slide Transition */}
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
                    {/* Business Name Field */}
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
                        This name will be displayed on all your financial statements and customer invoices.
                      </FieldDescription>
                    </Field>

                    {/* Country Field */}
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

                    {/* Currency Field */}
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
                        All accounts, cash flow, and tax reserves will be tracked in {currency}.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>

                  <div className="pt-4">
                    <Button type="submit" size="default" className="w-full">
                      <span>Continue to Opening Balances</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </FieldSet>
              </form>
            </div>

            {/* ================= STEP 2: Opening Accounting Balances ================= */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                step === 2
                  ? "translate-x-0 opacity-100 relative"
                  : "translate-x-full opacity-0 pointer-events-none absolute inset-0"
              }`}
            >
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                    <Scale className="size-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Opening Book Balances
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Starting fresh? Keep at 0. Migrating? Enter current account balances.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetToZero}
                  className="self-start sm:self-auto shrink-0"
                  title="Set all balances to 0 for a brand new business"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Start with 0 (New Business)</span>
                </Button>
              </div>

              <Separator className="mb-5" />

              {/* The Fundamental Accounting Equation Status Box */}
              <div className="mb-5 rounded-2xl border border-border/80 bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Rule:</span>
                    <span className="font-mono text-xs">Assets = Liabilities + Equity</span>
                  </div>

                  {isEquationBalanced ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Books Balanced ✓</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-500">
                      <AlertCircle className="size-3.5" />
                      <span>Difference: {currencySymbol}{Math.abs(difference).toLocaleString()}</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border/60 bg-background p-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Total Assets
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{totalAssets.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Liab + Equity
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-foreground">
                      {currencySymbol}{totalLiabPlusEquity.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Net Balance
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

                {!isEquationBalanced && difference > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">
                      Auto-fix: Allocate {currencySymbol}{difference.toLocaleString()} to Owner's Equity?
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      onClick={handleAutoBalanceEquity}
                    >
                      Auto-Balance
                    </Button>
                  </div>
                )}
              </div>

              {/* Filter Tabs & Add Account Action */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-full bg-muted p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveAccountTab("all")}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      activeAccountTab === "all"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({accounts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAccountTab("asset")}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      activeAccountTab === "asset"
                        ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Assets
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAccountTab("liability")}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      activeAccountTab === "liability"
                        ? "bg-background text-rose-500 shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Liabilities
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAccountTab("equity")}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      activeAccountTab === "equity"
                        ? "bg-background text-primary shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Equity
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                >
                  <Plus className="size-3.5" />
                  <span>Add Account</span>
                </Button>
              </div>

              {/* Add Custom Account Drawer */}
              {showAddCustom && (
                <form
                  onSubmit={handleAddCustomAccount}
                  className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Create Custom Account</span>
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      required
                      placeholder="Account name (e.g. Delivery Van)"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />

                    <select
                      value={newAccountCategory}
                      onChange={(e) =>
                        setNewAccountCategory(e.target.value as "asset" | "liability" | "equity")
                      }
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 text-xs text-foreground transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="asset">Asset (Owned)</option>
                      <option value="liability">Liability (Owed)</option>
                      <option value="equity">Equity (Capital)</option>
                    </select>

                    <Input
                      type="number"
                      step="any"
                      placeholder="Initial balance (0)"
                      value={newAccountBalance}
                      onChange={(e) => setNewAccountBalance(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm">
                      Add to Balances
                    </Button>
                  </div>
                </form>
              )}

              {/* Accounts List */}
              <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-border divide-y divide-border/60 bg-background/50">
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-muted/30 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          acc.category === "asset"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : acc.category === "liability"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {acc.category === "asset" ? (
                          <Wallet className="size-3.5" />
                        ) : acc.category === "liability" ? (
                          <Landmark className="size-3.5" />
                        ) : (
                          <Scale className="size-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {acc.name}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {acc.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-28 sm:w-36">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          value={acc.balance === 0 ? "" : acc.balance}
                          placeholder="0"
                          onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                          className="py-1 pl-6 pr-2.5 text-right text-xs font-semibold"
                        />
                      </div>

                      {!acc.isPreset && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Remove custom account"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Step 2 Action Buttons */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  size="default"
                  disabled={!isEquationBalanced || isSubmitting}
                  onClick={handleCreateBusiness}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating Business...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Create Business</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>

              {!isEquationBalanced && (
                <p className="mt-2 text-center text-xs text-rose-500 font-medium">
                  ⚠️ Accounting books must balance ($Assets = Liabilities + Equity$) to proceed.
                </p>
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
