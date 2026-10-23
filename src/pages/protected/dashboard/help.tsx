import { ArrowRight, BookOpen, CircleHelp, FileText, Package, ReceiptText } from "lucide-react";

const guides = [
  {
    icon: ReceiptText,
    title: "Record what happened",
    intro: "Use New entry whenever money comes in or goes out, or when you need to record a sale, purchase, or transfer.",
    steps: [
      "Choose the entry type that best describes the real business event.",
      "Enter the date, amount, payment status or account, and a short description you will recognize later.",
      "Add a customer or vendor, invoice or reference, and any tax amount when they apply.",
      "Save the entry. Ihsaab posts the matching accounting lines and updates balances and reports.",
    ],
    note: "For an unpaid customer sale or vendor bill, use the unpaid option so the amount stays in receivables or payables until payment is recorded. Transfers move money between accounts and do not count as income or expense.",
  },
  {
    icon: FileText,
    title: "Review transactions and the general ledger",
    intro: "Transactions are the plain-language records you create. The General Ledger shows the accounting lines Ihsaab posts for every transaction.",
    steps: [
      "Open Transactions to search and filter the entries you have recorded.",
      "Open General Ledger to inspect dates, descriptions, accounts, debits, credits, and running balances.",
      "Open a ledger entry for its transaction details and related lines.",
      "If an entry is wrong, use its correction action. Ihsaab keeps the reversal and replacement in the history.",
    ],
    note: "Opening balances are locked after setup. Review them carefully before you start recording day-to-day activity.",
  },
  {
    icon: BookOpen,
    title: "Understand Accounts",
    intro: "Accounts group business activity into the five main accounting categories. Each account is shown as a T account with debits on the left and credits on the right.",
    steps: [
      "Assets: what the business owns or is owed, such as cash, bank, inventory, and customer balances.",
      "Liabilities: what the business owes, such as supplier balances and taxes payable.",
      "Equity: the owner's interest and accumulated business results.",
      "Income: sales and other earnings.",
      "Expenses: costs incurred to run the business.",
    ],
    note: "Ihsaab chooses accounts when it posts entries. Use the account activity to understand how a balance was built; you do not need to create debit or credit lines yourself.",
  },
  {
    icon: Package,
    title: "Contacts and inventory",
    intro: "Contacts help you track who you buy from and sell to. Inventory helps you follow products and stock quantities.",
    steps: [
      "Add customers and vendors in Contacts, then select them on relevant entries.",
      "Create products in Inventory with their price and starting stock where applicable.",
      "Record stock purchases and product sales through New entry so the accounting record stays connected to the business event.",
      "Check product quantities and transaction history when stock looks unexpected.",
    ],
    note: "Keep product names, quantities, and prices consistent. Services and non-stock expenses do not need inventory items.",
  },
  {
    icon: FileText,
    title: "Read financial statements",
    intro: "Financial Statements turns posted entries into the reports commonly used to understand a small business.",
    steps: [
      "Profit & Loss: income, expenses, and profit or loss for a selected period.",
      "Balance Sheet: assets, liabilities, and equity at a point in time.",
      "Cash Flow: cash movements grouped into operating, investing, and financing activity.",
      "Trial Balance: debit and credit balances across accounts, useful for checking that the books balance.",
    ],
    note: "Choose the reporting dates carefully. Reports reflect what has been recorded in Ihsaab; they cannot include missing transactions or verify source documents for you.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-primary/15 bg-primary/5 p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <CircleHelp className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ihsaab Beta Guide</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your books start with what happened.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Create everyday business entries in plain language. Ihsaab handles the ledger postings and keeps your account balances and financial statements up to date. This guide explains the main workflow and where to review your records.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"><span className="size-2 rounded-full bg-amber-500" />Beta product · features and workflows are still evolving</div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {guides.map(({ icon: Icon, title, intro, steps, note }, index) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
            <h3 className="text-lg font-semibold">{String(index + 1).padStart(2, "0")} · {title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{intro}</p>
            <ol className="mt-4 space-y-2.5">
              {steps.map((step) => <li key={step} className="flex gap-2.5 text-sm leading-5"><ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" /><span>{step}</span></li>)}
            </ol>
            <p className="mt-4 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">{note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold">A few habits that keep your books useful</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <li>Record entries promptly and use clear descriptions.</li>
          <li>Choose the correct business date and payment status.</li>
          <li>Review the Overview and statements regularly for unusual balances.</li>
          <li>Keep receipts and source documents for your own records.</li>
          <li>Check your business currency and details in Business Settings.</li>
          <li>When reporting a beta issue, include the page, entry date, and what you expected to happen.</li>
        </ul>
        <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Need help or found something unexpected? Share the details with the Ihsaab team so we can investigate and improve the beta.</p>
      </section>
    </div>
  );
}
