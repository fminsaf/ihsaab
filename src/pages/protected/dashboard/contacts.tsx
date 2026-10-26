import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import supabase from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "../../../components/ui/toast";
import { useLocale } from "../../../lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  notes: string | null;
}
interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  category: string | null;
  created_at: string;
  date?: string | null;
}
interface OutletCtx {
  bid: string;
}

export default function ContactsPage() {
  const { bid } = useOutletContext<OutletCtx>();
  const { t } = useLocale();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    notes: "",
  });

  const fetchContacts = useCallback(async () => {
    if (!bid) return;
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, email, phone, company_name, notes")
      .eq("business_id", bid)
      .order("name");
    if (error)
      toast.add({
        description:
          "Could not load contacts. Check that the contacts table is set up.",
        type: "error",
      });
    const rows = (data ?? []) as Contact[];
    setContacts(rows);
    setSelected((current) =>
      current
        ? (rows.find((contact) => contact.id === current.id) ?? null)
        : (rows[0] ?? null),
    );
    setLoading(false);
  }, [bid]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    let active = true;
    async function loadTransactions() {
      if (!selected) {
        setTransactions([]);
        return;
      }
      const { data, error } = await supabase
        .from("transactions")
        .select("id, type, amount, description, category, created_at, date")
        .eq("business_id", bid)
        .eq("contact_id", selected.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setTransactions([]);
        toast.add({
          description:
            "Could not load this contact's transactions. Apply the contact_id SQL below first.",
          type: "error",
        });
      } else setTransactions(data ?? []);
    }
    void loadTransactions();
    return () => {
      active = false;
    };
  }, [bid, selected]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.company_name, contact.phone].some(
        (value) => value?.toLocaleLowerCase().includes(query),
      ),
    );
  }, [contacts, search]);

  function openAddContact() {
    setEditingContact(false);
    setForm({ name: "", email: "", phone: "", company_name: "", notes: "" });
    setDialogOpen(true);
  }

  function openEditContact() {
    if (!selected) return;
    setEditingContact(true);
    setForm({
      name: selected.name,
      email: selected.email ?? "",
      phone: selected.phone ?? "",
      company_name: selected.company_name ?? "",
      notes: selected.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function saveContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company_name: form.company_name.trim() || null,
      notes: form.notes.trim() || null,
    };
    const result =
      editingContact && selected
        ? await supabase
            .from("contacts")
            .update(payload)
            .eq("id", selected.id)
            .eq("business_id", bid)
            .select("id, name, email, phone, company_name, notes")
            .single()
        : await supabase
            .from("contacts")
            .insert({ ...payload, business_id: bid })
            .select("id, name, email, phone, company_name, notes")
            .single();
    setSaving(false);
    if (result.error) {
      toast.add({ description: result.error.message, type: "error" });
      return;
    }
    const contact = result.data as Contact;
    setContacts((current) =>
      editingContact
        ? current
            .map((item) => (item.id === contact.id ? contact : item))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [...current, contact].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setSelected(contact);
    setForm({ name: "", email: "", phone: "", company_name: "", notes: "" });
    setDialogOpen(false);
    toast.add({
      description: editingContact ? "Contact updated." : "Contact created.",
      type: "success",
    });
  }

  async function deleteContact() {
    if (!selected || deleting) return;
    setDeleting(true);
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", selected.id)
      .eq("business_id", bid);
    setDeleting(false);
    if (error) {
      toast.add({ description: error.message, type: "error" });
      return;
    }
    const remaining = contacts.filter((contact) => contact.id !== selected.id);
    setContacts(remaining);
    setSelected(remaining[0] ?? null);
    setTransactions([]);
    setDeleteOpen(false);
    toast.add({ description: "Contact deleted.", type: "success" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{t("contactsTitle")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("contactsSubtitle")}
          </p>
        </div>
        <Button className="gap-2 rounded-full" onClick={openAddContact}>
          <Plus className="size-4" /> {t("addContact")}
        </Button>
      </div>

      <div className="grid min-h-[480px] gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="border-border border-b p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                aria-label="Search contacts"
                placeholder="Search contacts"
                value={search}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(event.target.value)
                }
                className="pl-9"
              />
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              {filtered.length} contact{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="max-h-[560px] overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-muted h-16 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : filtered.length ? (
              filtered.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelected(contact)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected?.id === contact.id ? "bg-primary/10 text-foreground" : "hover:bg-muted/60"}`}
                >
                  <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Users className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {contact.name}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {contact.company_name ||
                        contact.email ||
                        contact.phone ||
                        "Contact"}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="text-muted-foreground/50 mx-auto size-8" />
                <p className="mt-3 text-sm font-medium">
                  {search ? "No matching contacts" : t("noContacts")}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Add a customer or vendor to get started.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-border bg-card rounded-2xl border p-5 sm:p-6">
          {selected ? (
            <>
              <div className="border-border flex items-start justify-between gap-3 border-b pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
                    <Building2 className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">
                      {selected.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {selected.company_name || "Contact details"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={openEditContact}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="border-border text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 border-b py-4 text-sm">
                {selected.email && (
                  <a
                    className="hover:text-foreground inline-flex items-center gap-2"
                    href={`mailto:${selected.email}`}
                  >
                    <Mail className="size-4" />
                    {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <a
                    className="hover:text-foreground inline-flex items-center gap-2"
                    href={`tel:${selected.phone}`}
                  >
                    <Phone className="size-4" />
                    {selected.phone}
                  </a>
                )}
                {!selected.email && !selected.phone && (
                  <span>No contact details added.</span>
                )}
              </div>
              {selected.notes && (
                <p className="border-border text-muted-foreground border-b py-4 text-sm">
                  {selected.notes}
                </p>
              )}
              <div className="pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Transaction history</h4>
                  <span className="text-muted-foreground text-xs">
                    {transactions.length} record
                    {transactions.length === 1 ? "" : "s"}
                  </span>
                </div>
                {transactions.length ? (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="border-border flex items-center gap-3 rounded-xl border px-3 py-3"
                      >
                        <span
                          className={`size-2 shrink-0 rounded-full ${tx.type === "income" ? "bg-emerald-500" : tx.type === "expense" ? "bg-red-500" : "bg-blue-500"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium capitalize">
                            {tx.type}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {tx.description || tx.category || "Transaction"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {Number(tx.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(
                              tx.date || tx.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-border rounded-xl border border-dashed p-8 text-center">
                    <p className="text-sm font-medium">
                      No linked transactions yet
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Select this contact when recording a new transaction.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <Users className="text-muted-foreground/50 size-10" />
              <h3 className="mt-3 font-semibold">Select a contact</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Contact details and transaction history will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !saving && setDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit contact" : "Add a contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update this contact’s details. Their transaction history stays linked."
                : "Create a customer or vendor for this business."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveContact} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                autoFocus
                required
                value={form.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Person or business name"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={form.phone}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-company">Company name</Label>
              <Input
                id="contact-company"
                value={form.company_name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, company_name: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-notes">Notes</Label>
              <Input
                id="contact-notes"
                value={form.notes}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setDialogOpen(false)}
              >
                <X className="mr-1 size-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingContact
                    ? "Save changes"
                    : "Save contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected?.name}?</DialogTitle>
            <DialogDescription>
              This removes the contact. Any linked transactions will remain, but
              will no longer be connected to this contact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void deleteContact()}
            >
              {deleting ? "Deleting…" : "Delete contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
