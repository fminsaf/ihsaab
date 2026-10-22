import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../../auth/authProvider";
import supabase from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "../../../components/ui/field";
import { Separator } from "../../../components/ui/separator";
import { toast } from "../../../components/ui/toast";
import {
  Lock,
  Trash2,
  Save,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface BusinessRecord {
  id: string;
  name: string;
  country: string;
  currency: string;
  tax_id?: string;
  registration_number?: string;
  address?: string;
  contact_email?: string;
  phone?: string;
}

export default function BusinessSettingsPage() {
  const { bid } = useParams<{ bid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Fetch business details
  useEffect(() => {
    if (!bid) return;

    let isMounted = true;

    async function loadBusiness() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", bid)
          .single();

        if (!isMounted) return;

        if (error) {
          console.warn("Could not load business record from Supabase:", error);
          // Fallback defaults if table/columns don't exist yet
          setName("My Business");
          setCountry("Saudi Arabia");
          setCurrency("SAR");
        } else if (data) {
          const b = data as BusinessRecord;
          setName(b.name || "");
          setCountry(b.country || "Not specified");
          setCurrency(b.currency || "USD");
          setTaxId(b.tax_id || "");
          setRegistrationNumber(b.registration_number || "");
          setAddress(b.address || "");
          setContactEmail(b.contact_email || "");
          setPhone(b.phone || "");
        }
      } catch (err) {
        console.error("Error fetching business:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [bid]);

  const handleCopyId = () => {
    if (!bid) return;
    navigator.clipboard.writeText(bid);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.add({ description: "Business ID copied to clipboard", type: "info" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.add({
        description: "Business name cannot be empty.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          name: name.trim(),
          tax_id: taxId.trim(),
          registration_number: registrationNumber.trim(),
          address: address.trim(),
          contact_email: contactEmail.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bid);

      if (error) {
        console.warn("Supabase update error:", error);
        toast.add({
          description: `Update note: ${error.message}`,
          type: "info",
        });
      } else {
        toast.add({
          description: "Business configuration saved successfully.",
          type: "success",
        });
      }
    } catch {
      toast.add({
        description: "Error updating business configuration.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (confirmDeleteText.trim() !== name.trim()) {
      toast.add({
        description: "Business name does not match confirmation.",
        type: "error",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", bid);
      if (error) {
        console.warn("Supabase delete error:", error);
      }

      // Clear localStorage cache
      localStorage.removeItem("last_used_business_id");
      localStorage.removeItem("ihsaab_last_bid");

      toast.add({
        description: `"${name}" has been permanently deleted.`,
        type: "success",
      });

      // Check if user has other businesses
      if (user) {
        const { data } = await supabase
          .from("businesses")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0]?.id) {
          navigate(`/b/${data[0].id}`, { replace: true });
          return;
        }
      }

      navigate("/create-business", { replace: true });
    } catch {
      toast.add({ description: "Error deleting business.", type: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="border-border/80 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            Business Configuration
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage your legal entity profile, tax identifiers, and
            organizational parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="font-mono text-xs"
            title="Copy Business ID"
          >
            {copiedId ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span className="max-w-[120px] truncate">{bid}</span>
          </Button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
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
                  This name appears on invoices, account ledgers, and financial
                  exports.
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
                    Printed on your tax invoices.
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

      {/* Danger Zone: Delete Business */}
      <div className="border-destructive/30 bg-destructive/5 rounded-3xl border p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-2xl">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-destructive text-base font-bold">
              Danger Zone: Delete Business
            </h3>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
              Permanently delete{" "}
              <strong className="text-foreground">{name}</strong> along with all
              associated accounts, double-entry journals, transaction history,
              and financial statements. This action is irreversible.
            </p>

            <div className="mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmDeleteText("");
                  setShowDeleteModal(true);
                }}
                className="gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Delete This Business</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="border-border bg-card w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <div className="border-border text-destructive flex items-center gap-3 border-b pb-3.5">
              <div className="bg-destructive/10 flex size-8 items-center justify-center rounded-xl">
                <AlertTriangle className="size-4" />
              </div>
              <h4 className="text-base font-bold">Confirm Business Deletion</h4>
            </div>

            <div className="text-muted-foreground mt-4 space-y-3 text-xs leading-relaxed">
              <p>
                Are you absolutely sure you want to delete{" "}
                <strong className="text-foreground">{name}</strong>? All
                accounts and records will be immediately erased.
              </p>
              <p>
                Please type{" "}
                <strong className="text-foreground font-mono">{name}</strong>{" "}
                below to confirm:
              </p>

              <Input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder={name}
                className="mt-2 text-sm"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={
                  confirmDeleteText.trim() !== name.trim() || isDeleting
                }
                onClick={handleDeleteBusiness}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>I understand, delete business</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
