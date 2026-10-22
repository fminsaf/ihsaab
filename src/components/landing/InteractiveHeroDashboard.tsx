import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
  RotateCcw,
  Wallet,
  CheckCircle2,
  DollarSign,
  Coffee,
  Laptop,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
} from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  timestamp: string;
  journal: {
    debitAccount: string;
    creditAccount: string;
    taxSegregated: number;
  };
}

interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  icon: typeof Coffee;
  startingTransactions: Transaction[];
}

const BUSINESS_PROFILES: BusinessProfile[] = [
  {
    id: "cafe",
    name: "Bloom & Roast Cafe",
    type: "Food & Beverage",
    icon: Coffee,
    startingTransactions: [
      {
        id: "tx-1",
        description: "Saturday Morning Walk-in Rush",
        amount: 840,
        type: "income",
        category: "Food & Beverage Sales",
        timestamp: "Today, 11:30 AM",
        journal: {
          debitAccount: "Operating Cash Account",
          creditAccount: "F&B Revenue",
          taxSegregated: 84,
        },
      },
      {
        id: "tx-2",
        description: "Specialty Oat Milk & Beans Delivery",
        amount: 320,
        type: "expense",
        category: "Cost of Goods Sold",
        timestamp: "Today, 09:15 AM",
        journal: {
          debitAccount: "Inventory / Raw Materials",
          creditAccount: "Operating Cash Account",
          taxSegregated: 32,
        },
      },
      {
        id: "tx-3",
        description: "Commercial Espresso Grinder Maintenance",
        amount: 140,
        type: "expense",
        category: "Repairs & Equipment",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Equipment Maintenance",
          creditAccount: "Operating Cash Account",
          taxSegregated: 14,
        },
      },
      {
        id: "tx-4",
        description: "Local Office Weekly Coffee Catering",
        amount: 620,
        type: "income",
        category: "Catering Contracts",
        timestamp: "2 days ago",
        journal: {
          debitAccount: "Accounts Receivable / Cash",
          creditAccount: "Catering Income",
          taxSegregated: 62,
        },
      },
    ],
  },
  {
    id: "agency",
    name: "Apex Studio & Design",
    type: "Digital Agency",
    icon: Laptop,
    startingTransactions: [
      {
        id: "tx-a1",
        description: "Brand Identity Project Milestone 2",
        amount: 2800,
        type: "income",
        category: "Design Services",
        timestamp: "Today, 10:00 AM",
        journal: {
          debitAccount: "Operating Bank",
          creditAccount: "Professional Services Revenue",
          taxSegregated: 280,
        },
      },
      {
        id: "tx-a2",
        description: "Figma & Adobe Cloud Subscriptions",
        amount: 195,
        type: "expense",
        category: "Software Subscriptions",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Software & SaaS Expense",
          creditAccount: "Business Credit Card",
          taxSegregated: 19.5,
        },
      },
      {
        id: "tx-a3",
        description: "SEO Retainer - Tech Startup Client",
        amount: 1500,
        type: "income",
        category: "Retainers",
        timestamp: "3 days ago",
        journal: {
          debitAccount: "Operating Bank",
          creditAccount: "Retainer Revenue",
          taxSegregated: 150,
        },
      },
    ],
  },
  {
    id: "retail",
    name: "Haven Living Boutique",
    type: "Retail Store",
    icon: ShoppingBag,
    startingTransactions: [
      {
        id: "tx-r1",
        description: "Weekend In-Store Footwear & Decor Sales",
        amount: 1650,
        type: "income",
        category: "Store Merchandise",
        timestamp: "Today, 04:30 PM",
        journal: {
          debitAccount: "Merchant Bank Deposit",
          creditAccount: "Retail Sales",
          taxSegregated: 165,
        },
      },
      {
        id: "tx-r2",
        description: "Wholesale Ceramic Home Ware Shipment",
        amount: 580,
        type: "expense",
        category: "Inventory Purchases",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Store Inventory Asset",
          creditAccount: "Accounts Payable / Bank",
          taxSegregated: 58,
        },
      },
    ],
  },
];

const PRESETS = [
  { label: "+ $450 Wholesale Pastry Sale", amount: 450, type: "income" as const, category: "Bakery Sales" },
  { label: "- $120 Store Fiber Internet", amount: 120, type: "expense" as const, category: "Utilities" },
  { label: "+ $1,250 Corporate Event Retainer", amount: 1250, type: "income" as const, category: "Event Catering" },
  { label: "- $290 POS Terminal & Packaging Supplies", amount: 290, type: "expense" as const, category: "Store Supplies" },
];

export function InteractiveHeroDashboard() {
  const [selectedProfileId, setSelectedProfileId] = useState("cafe");
  const currentProfile =
    BUSINESS_PROFILES.find((p) => p.id === selectedProfileId) ||
    BUSINESS_PROFILES[0];

  const [transactions, setTransactions] = useState<Transaction[]>(
    currentProfile.startingTransactions,
  );
  const [activeFilter, setActiveFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [selectedTxForDetail, setSelectedTxForDetail] =
    useState<Transaction | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(
    "✨ Try adding a new entry below to watch Ihsaab autopilot your books!",
  );

  // Custom Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customType, setCustomType] = useState<"income" | "expense">("income");
  const [customCategory, setCustomCategory] = useState("General Sales");

  // Recalculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const autoTaxReserved = Math.round(Math.max(0, netProfit * 0.15));
  const bankBalance = 14500 + netProfit;

  // Handle switching business profiles
  const handleSwitchProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const prof = BUSINESS_PROFILES.find((p) => p.id === profileId);
    if (prof) {
      setTransactions(prof.startingTransactions);
      setLastActionMessage(
        `Switched to ${prof.name}. Ready for real-time entries!`,
      );
    }
  };

  // Add an entry (preset or custom)
  const addTransaction = (
    desc: string,
    amount: number,
    type: "income" | "expense",
    category: string,
  ) => {
    if (!desc || amount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      description: desc,
      amount,
      type,
      category,
      timestamp: "Just now",
      journal: {
        debitAccount:
          type === "income"
            ? "Operating Cash Account"
            : `${category} Expense`,
        creditAccount:
          type === "income"
            ? `${category} Revenue`
            : "Operating Cash Account",
        taxSegregated: Math.round(amount * 0.1),
      },
    };

    setTransactions([newTx, ...transactions]);
    setLastActionMessage(
      `⚡ Done! Ihsaab auto-booked "${desc}" (${type === "income" ? "+" : "-"}$${amount.toLocaleString()}), segregated 10% tax, & updated P&L in 12ms.`,
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    addTransaction(customDesc || "Quick Business Entry", parsed, customType, customCategory);
    setCustomDesc("");
    setCustomAmount("");
    setShowAddModal(false);
  };

  const resetTransactions = () => {
    setTransactions(currentProfile.startingTransactions);
    setLastActionMessage("Simulator reset to baseline data.");
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === "all") return true;
    return t.type === activeFilter;
  });

  const ProfileIcon = currentProfile.icon;

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-border/70 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl transition-all">
      {/* Top Window Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Mac-style window controls */}
          <div className="flex items-center gap-1.5 pr-2">
            <span className="size-3 rounded-full bg-destructive/70 inline-block" />
            <span className="size-3 rounded-full bg-amber-400 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline-block">
            Live Interactive Simulator
          </span>
        </div>

        {/* Profile Switcher Pills */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 p-1">
          {BUSINESS_PROFILES.map((p) => {
            const Icon = p.icon;
            const isSelected = p.id === selectedProfileId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSwitchProfile(p.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3" />
                <span className="hidden sm:inline">{p.name.split(" ")[0]}</span>
                <span className="sm:hidden">{p.name.slice(0, 3)}</span>
              </button>
            );
          })}
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={resetTransactions}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Reset simulator"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Business Header Banner */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ProfileIcon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">
                  {currentProfile.name}
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Books Balanced ✓
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentProfile.type} • Automated Double-Entry Ledger Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:scale-[1.02]"
            >
              <Plus className="size-4" />
              <span>Create New Entry</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Revenue */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Revenue</span>
              <div className="rounded-xl bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Auto-categorized & verified
            </p>
          </div>

          {/* Card 2: Expenses */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Operating Expenses</span>
              <div className="rounded-xl bg-destructive/10 p-1.5 text-destructive">
                <TrendingDown className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${totalExpense.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              100% tax write-off ready
            </p>
          </div>

          {/* Card 3: Net Profit */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Net Profit</span>
              <div className="rounded-xl bg-primary/10 p-1.5 text-primary">
                <DollarSign className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl text-primary">
              ${netProfit.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {totalIncome > 0
                ? `${Math.round((netProfit / totalIncome) * 100)}% margin`
                : "0% margin"}
            </p>
          </div>

          {/* Card 4: Bank & Tax Reserve */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Cash in Bank</span>
              <div className="rounded-xl bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                <Wallet className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${bankBalance.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ${autoTaxReserved.toLocaleString()} auto-held for tax
            </p>
          </div>
        </div>

        {/* Magic Automation Feedback Banner */}
        {lastActionMessage && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground sm:text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary animate-pulse" />
            <div className="flex-1 font-medium">{lastActionMessage}</div>
          </div>
        )}

        {/* 1-Click Quick Add Presets Bar */}
        <div className="mb-6 rounded-2xl border border-border/80 bg-muted/20 p-4">
          <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Try a 1-Click Quick Entry:
            </span>
            <span className="text-[11px]">Click any item to simulate a real business transaction</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  addTransaction(p.label.replace(/^[+-]\s\$\d+\s/, ""), p.amount, p.type, p.category)
                }
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:scale-[1.02]"
              >
                <span
                  className={
                    p.type === "income"
                      ? "text-emerald-600 font-semibold dark:text-emerald-400"
                      : "text-rose-500 font-semibold"
                  }
                >
                  {p.type === "income" ? "+" : "-"} ${p.amount}
                </span>
                <span className="text-muted-foreground group-hover:text-foreground">
                  {p.label.replace(/^[+-]\s\$\d+\s/, "")}
                </span>
                <Plus className="size-3 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions Ledger */}
        <div className="rounded-3xl border border-border/80 bg-background/50 overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
            <div>
              <h4 className="text-sm font-bold">Live Business Journal</h4>
              <p className="text-[11px] text-muted-foreground">
                All entries are automatically converted to balanced GAAP double-entry books
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  activeFilter === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("income")}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  activeFilter === "income"
                    ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("expense")}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  activeFilter === "expense"
                    ? "bg-background text-rose-500 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Expenses
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-border/50 max-h-[340px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No transactions in this category yet.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 transition hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="size-4" />
                        ) : (
                          <ArrowDownRight className="size-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {tx.description}
                          </span>
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {tx.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>{tx.timestamp}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTxForDetail(tx)}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Info className="size-3" />
                            <span>Behind the scenes (Double-entry)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-500"
                          }`}
                        >
                          {isIncome ? "+" : "-"}${tx.amount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          Tax auto-held: ${tx.journal.taxSegregated}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Behind-the-scenes Double-Entry Modal */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h4 className="text-base font-bold">Ihsaab Automated Journal</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForDetail(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm">
              <p className="text-muted-foreground text-xs leading-relaxed">
                As an SMB owner, you only typed <span className="font-semibold text-foreground">"{selectedTxForDetail.description}"</span> for{" "}
                <span className="font-semibold text-foreground">${selectedTxForDetail.amount}</span>.
                Here is the GAAP double-entry journal Ihsaab automatically executed behind the scenes:
              </p>

              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">DEBIT:</span>
                  <span className="font-semibold text-foreground">
                    {selectedTxForDetail.journal.debitAccount} (+${selectedTxForDetail.amount})
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">CREDIT:</span>
                  <span className="font-semibold text-foreground">
                    {selectedTxForDetail.journal.creditAccount} (+${selectedTxForDetail.amount})
                  </span>
                </div>
                <div className="flex justify-between font-mono pt-2 border-t border-border">
                  <span className="text-muted-foreground">TAX PROVISION:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ${selectedTxForDetail.journal.taxSegregated} segregated into Tax Reserve
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Zero accounting jargon needed. Your CPA receives clean audit-ready books.</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedTxForDetail(null)}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Entry Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>
                <h4 className="text-base font-bold">Add Business Entry</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Entry Type</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("income")}
                    className={`rounded-2xl border py-2.5 text-xs font-bold transition ${
                      customType === "income"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    + Income / Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomType("expense")}
                    className={`rounded-2xl border py-2.5 text-xs font-bold transition ${
                      customType === "expense"
                        ? "border-rose-500 bg-rose-500/10 text-rose-500"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    - Expense / Bill
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">What happened?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sold 20 ceramic mugs or Paid storefront rent"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="250.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    {customType === "income" ? (
                      <>
                        <option value="Direct Sales">Direct Sales</option>
                        <option value="Services">Services</option>
                        <option value="Catering">Catering</option>
                        <option value="Consulting">Consulting</option>
                      </>
                    ) : (
                      <>
                        <option value="Supplies & Inventory">Supplies & Inventory</option>
                        <option value="Rent & Utilities">Rent & Utilities</option>
                        <option value="Equipment & Repair">Equipment & Repair</option>
                        <option value="Marketing & Ads">Marketing & Ads</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
                💡 <span className="font-medium text-foreground">No accounting knowledge needed:</span> Ihsaab will automatically categorize this, update your cash flow, calculate profit margins, and segregate taxes.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Post Entry & Automate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
