import { Button } from "../ui/button";
import { ArrowRight, ArrowLeft, Rocket, Scale, Sparkles, Loader2 } from "lucide-react";

interface BusinessStartChoiceProps {
  businessName: string;
  isSubmitting: boolean;
  onCreateFreshBusiness: () => void;
  onChooseExisting: () => void;
  onBack: () => void;
}

export function BusinessStartChoice({ businessName, isSubmitting, onCreateFreshBusiness, onChooseExisting, onBack }: BusinessStartChoiceProps) {
  return (
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
                          onClick={onCreateFreshBusiness}
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
                          onClick={() => onChooseExisting()}
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
                      onClick={() => onBack()}
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back to Step 1</span>
                    </Button>
                  </div>
                </div>  );
}
