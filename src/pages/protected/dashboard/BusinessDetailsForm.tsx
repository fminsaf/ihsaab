import type { FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldSet } from "../../../components/ui/field";
import { Separator } from "../../../components/ui/separator";
import { Lock, Save, Loader2 } from "lucide-react";

interface BusinessDetailsFormProps {
  name: string; setName: (value: string) => void;
  country: string; currency: string;
  taxId: string; setTaxId: (value: string) => void;
  registrationNumber: string; setRegistrationNumber: (value: string) => void;
  address: string; setAddress: (value: string) => void;
  contactEmail: string; setContactEmail: (value: string) => void;
  phone: string; setPhone: (value: string) => void;
  isSaving: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void;
}

export function BusinessDetailsForm({ name, setName, country, currency, taxId, setTaxId, registrationNumber, setRegistrationNumber, address, setAddress, contactEmail, setContactEmail, phone, setPhone, isSaving, onSave }: BusinessDetailsFormProps) {
  return (
      <form onSubmit={onSave} className="space-y-6">
        <div className="border-border/80 bg-card rounded-3xl border p-6 shadow-xs sm:p-8">
          <h3 className="text-foreground mb-4 text-base font-bold">
            General Business Details
          </h3>

          <FieldSet>
            <FieldGroup>
              {/* Business Name (Editable) */}
              <Field>
                <FieldLabel htmlFor="biz-name">
                  Business Legal / Trading Name *
                </FieldLabel>
                <Input
                  id="biz-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Studio, Al-Noor Cafe"
                />
                <FieldDescription>
                  This name appears on your dashboard, ledgers, and financial
                  statements.
                </FieldDescription>
              </Field>

              {/* Country (Read-only) */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="biz-country">
                    Country / Tax Jurisdiction
                  </FieldLabel>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                    <Lock className="size-3" /> Not editable
                  </span>
                </div>
                <Input
                  id="biz-country"
                  type="text"
                  disabled
                  value={country}
                  className="bg-muted/50 cursor-not-allowed opacity-80"
                />
                <FieldDescription>
                  Tax jurisdiction is fixed to your initial setup to preserve
                  legal and regulatory compliance.
                </FieldDescription>
              </Field>

              {/* Operating Currency (Read-only) */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="biz-currency">
                    Base Operating Currency
                  </FieldLabel>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                    <Lock className="size-3" /> Not editable
                  </span>
                </div>
                <Input
                  id="biz-currency"
                  type="text"
                  disabled
                  value={currency}
                  className="bg-muted/50 cursor-not-allowed font-mono font-semibold opacity-80"
                />
                <FieldDescription>
                  Base currency cannot be changed once transactions and ledgers
                  are initialized.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator className="my-6" />

          <h3 className="text-foreground mb-4 text-base font-bold">
            Tax & Legal Identification
          </h3>

          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Tax ID / VAT / GSTIN */}
                <Field>
                  <FieldLabel htmlFor="tax-id">
                    Tax ID / VAT / GSTIN Number
                  </FieldLabel>
                  <Input
                    id="tax-id"
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="e.g. 300123456700003"
                  />
                  <FieldDescription>
                    Saved with your business profile.
                  </FieldDescription>
                </Field>

                {/* Company Registration (CR) */}
                <Field>
                  <FieldLabel htmlFor="reg-num">
                    Commercial Registration (CR)
                  </FieldLabel>
                  <Input
                    id="reg-num"
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. 1010123456"
                  />
                  <FieldDescription>
                    Official registration identifier.
                  </FieldDescription>
                </Field>
              </div>

              {/* Operating Address */}
              <Field>
                <FieldLabel htmlFor="address">
                  Registered Business Address
                </FieldLabel>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Contact Email */}
                <Field>
                  <FieldLabel htmlFor="contact-email">
                    Invoicing & Receipt Email
                  </FieldLabel>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="billing@yourbusiness.com"
                  />
                </Field>

                {/* Phone */}
                <Field>
                  <FieldLabel htmlFor="phone">Business Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

  );
}
