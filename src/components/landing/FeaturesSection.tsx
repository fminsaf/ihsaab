import {
  MessageSquareCheck,
  PiggyBank,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Smartphone,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquareCheck,
      title: "Zero-Jargon Bookkeeping",
      description:
        "No complex charts of accounts, no debit/credit rules. Type 'Bought supplies for $80' and Ihsaab knows exactly which ledger accounts to touch.",
    },
    {
      icon: PiggyBank,
      title: "Automated Tax Vault",
      description:
        "Ihsaab automatically estimates and isolates your sales tax and income tax provisions with every entry so you never face a terrifying year-end tax bill.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Cash Runway",
      description:
        "Instantly know how much real profit you made this month and how many weeks of operating expenses your bank balance covers.",
    },
    {
      icon: Receipt,
      title: "Smart Invoicing & Tracking",
      description:
        "Create branded invoices in seconds. Once a client pays, the invoice automatically reconciles into your revenue accounts without manual matching.",
    },
    {
      icon: FileSpreadsheet,
      title: "1-Click CPA Export",
      description:
        "Your accountant will love you. When tax season hits, export GAAP-compliant Balance Sheets, P&Ls, and General Ledgers with one click.",
    },
    {
      icon: Smartphone,
      title: "Responsive On-The-Go Access",
      description:
        "Log a coffee shop sale, retail transaction, or vendor payment right from your phone behind the counter or while on a client site.",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Built for Small Business
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Everything your business needs. Nothing you don't.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Big enterprise accounting software is bloated and confusing. Ihsaab gives SMB
            owners complete financial mastery with zero friction.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security & Reliability Callout */}
        <div className="mt-12 rounded-3xl border border-border/80 bg-muted/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                Bank-Grade 256-Bit Encryption & Automated Daily Backups
              </h4>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Your financial data is private, encrypted, and isolated with Row Level Security.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="size-3.5" /> 99.99% Uptime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

