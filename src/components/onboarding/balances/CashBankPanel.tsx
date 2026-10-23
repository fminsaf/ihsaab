import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { BankAccount } from "../../../types/businessOnboarding";

interface CashBankPanelProps { currencySymbol: string; cashOnHand: number; setCashOnHand: (value: number) => void; bankAccounts: BankAccount[]; setBankAccounts: Dispatch<SetStateAction<BankAccount[]>> }
export function CashBankPanel({ currencySymbol, cashOnHand, setCashOnHand, bankAccounts, setBankAccounts }: CashBankPanelProps) {
  return (

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
  );
}
