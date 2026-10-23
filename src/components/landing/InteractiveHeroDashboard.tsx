import React, { useState } from "react";
import { BUSINESS_PROFILES, PRESETS, type Transaction } from "../../data/heroDemo";
import { BusinessEntryDialog } from "./demo/BusinessEntryDialog";
import { JournalDetailDialog } from "./demo/JournalDetailDialog";
import { SimulatorMetrics } from "./demo/SimulatorMetrics";
import { SimulatorJournal } from "./demo/SimulatorJournal";
import {
  Plus,
  Sparkles,
  RotateCcw,
} from "lucide-react";

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

        <SimulatorMetrics totalIncome={totalIncome} totalExpense={totalExpense} netProfit={netProfit} bankBalance={bankBalance} autoTaxReserved={autoTaxReserved} />

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

        <SimulatorJournal transactionsCount={transactions.length} filteredTransactions={filteredTransactions} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onSelectTransaction={setSelectedTxForDetail} />
      </div>

      <JournalDetailDialog transaction={selectedTxForDetail} onClose={() => setSelectedTxForDetail(null)} />
      <BusinessEntryDialog
        open={showAddModal}
        description={customDesc}
        amount={customAmount}
        type={customType}
        category={customCategory}
        onDescriptionChange={setCustomDesc}
        onAmountChange={setCustomAmount}
        onTypeChange={(value) => { setCustomType(value); setCustomCategory(value === "income" ? "Direct Sales" : "Supplies & Inventory") }}
        onCategoryChange={setCustomCategory}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCustomSubmit}
      />
    </div>
  );
}
