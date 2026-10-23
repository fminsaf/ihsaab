import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { LoanItem } from "../../../types/businessOnboarding";

interface LoansPanelProps { currencySymbol: string; loans: LoanItem[]; setLoans: Dispatch<SetStateAction<LoanItem[]>> }
export function LoansPanel({ currencySymbol, loans, setLoans }: LoansPanelProps) {
  return (
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
  );
}
