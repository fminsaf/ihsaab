import { ArrowUpRight, ArrowDownRight, Calendar, Info } from "lucide-react";
import type { Transaction } from "../../../data/heroDemo";

type TransactionFilter = "all" | "income" | "expense";
interface SimulatorJournalProps {
  transactionsCount: number;
  filteredTransactions: Transaction[];
  activeFilter: TransactionFilter;
  setActiveFilter: (filter: TransactionFilter) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

export function SimulatorJournal({ transactionsCount, filteredTransactions, activeFilter, setActiveFilter, onSelectTransaction }: SimulatorJournalProps) {
  return (
        <div className="rounded-3xl border border-border/80 bg-background/50 overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
            <div>
              <h4 className="text-sm font-bold">Live Business Journal</h4>
              <p className="text-[11px] text-muted-foreground">
                All entries are automatically converted to balanced double-entry books
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
                All ({transactionsCount})
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
                            onClick={() => onSelectTransaction(tx)}
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

  );
}
