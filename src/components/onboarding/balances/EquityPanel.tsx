import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { OwnerShare } from "../../../types/businessOnboarding";

interface EquityPanelProps { currencySymbol: string; owners: OwnerShare[]; setOwners: Dispatch<SetStateAction<OwnerShare[]>>; totalShares: number; netIncome: number; retainedEarnings: number; setRetainedEarnings: (value: number) => void }
export function EquityPanel({ currencySymbol, owners, setOwners, totalShares, netIncome, retainedEarnings, setRetainedEarnings }: EquityPanelProps) {
  return (
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
  );
}
