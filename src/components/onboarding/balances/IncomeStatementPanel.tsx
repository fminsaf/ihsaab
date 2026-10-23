import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, Trash2, TrendingDown, TrendingUp, Scale } from "lucide-react";
import type { IncomeStatementItem } from "../../../types/businessOnboarding";

interface IncomeStatementPanelProps { currencySymbol: string; incomeItems: IncomeStatementItem[]; setIncomeItems: Dispatch<SetStateAction<IncomeStatementItem[]>>; totalYtdRevenue: number; totalYtdExpenses: number; netIncome: number }
export function IncomeStatementPanel({ currencySymbol, incomeItems, setIncomeItems, totalYtdRevenue, totalYtdExpenses, netIncome }: IncomeStatementPanelProps) {
  return (
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
  );
}
