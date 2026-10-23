import type { FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldSet } from "../ui/field";
import { Separator } from "../ui/separator";
import { Building2, Globe, Coins, ArrowRight } from "lucide-react";
import { COUNTRIES, CURRENCIES } from "../../data/businessOptions";

interface BusinessDetailsStepProps {
  step: 1 | 2;
  businessName: string;
  setBusinessName: (value: string) => void;
  country: string;
  currency: string;
  onCountryChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onContinue: (event: FormEvent<HTMLFormElement>) => void;
}

export function BusinessDetailsStep({ step, businessName, setBusinessName, country, currency, onCountryChange, onCurrencyChange, onContinue }: BusinessDetailsStepProps) {
  return (
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

              <form onSubmit={onContinue}>
                <FieldSet>
                  <FieldGroup>
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
                        This will appear on all your invoices, tax summaries, and financial statements.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="biz-country">Country / Region *</FieldLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Globe className="size-4" />
                        </div>
                        <select
                          id="biz-country"
                          value={country}
                          onChange={(e) => onCountryChange(e.target.value)}
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

                    <Field>
                      <FieldLabel htmlFor="biz-currency">Operating Currency *</FieldLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Coins className="size-4" />
                        </div>
                        <select
                          id="biz-currency"
                          value={currency}
                          onChange={(e) => onCurrencyChange(e.target.value)}
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
                        All transactions, cash flow, and tax reserves will be tracked in {currency}.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>

                  <div className="pt-4">
                    <Button type="submit" size="default" className="w-full">
                      <span>Continue to Step 2</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </FieldSet>
              </form>
            </div>

  );
}
