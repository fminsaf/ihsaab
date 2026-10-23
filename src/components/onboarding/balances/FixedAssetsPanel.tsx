import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { FixedAsset } from "../../../types/businessOnboarding";

interface FixedAssetsPanelProps { currencySymbol: string; fixedAssets: FixedAsset[]; setFixedAssets: Dispatch<SetStateAction<FixedAsset[]>> }
export function FixedAssetsPanel({ currencySymbol, fixedAssets, setFixedAssets }: FixedAssetsPanelProps) {
  return (
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
  );
}
