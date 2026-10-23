import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../../auth/authProvider";
import supabase from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import { BusinessDetailsForm } from "./BusinessDetailsForm";
import { BusinessDangerZone } from "./BusinessDangerZone";
import { toast } from "../../../components/ui/toast";
import {
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

      <BusinessDetailsForm
        name={name} setName={setName} country={country} currency={currency}
        taxId={taxId} setTaxId={setTaxId} registrationNumber={registrationNumber}
        setRegistrationNumber={setRegistrationNumber} address={address} setAddress={setAddress}
        contactEmail={contactEmail} setContactEmail={setContactEmail} phone={phone} setPhone={setPhone}
        isSaving={isSaving} onSave={handleSave}
      />

      <BusinessDangerZone
        name={name} confirmDeleteText={confirmDeleteText}
        onConfirmDeleteTextChange={setConfirmDeleteText} isDeleting={isDeleting}
        showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
        onOpen={() => { setConfirmDeleteText(""); setShowDeleteModal(true) }}
        onDelete={handleDeleteBusiness}
      />
    </div>
  );
}
