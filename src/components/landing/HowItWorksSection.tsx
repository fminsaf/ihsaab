import { PlusCircle, Cpu, FileCheck } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Record What Happened",
      subtitle: "Just describe the transaction in plain human English",
      description:
        "Forget chart of accounts, debit/credit rules, or ledger codes. When you make a sale or pay an invoice, just record the amount and what it was for.",
      icon: PlusCircle,
      badge: "No accounting jargon",
      visualText: "Sold 10 artisan ceramics for $450 via card",
    },
    {
      number: "02",
      title: "Ihsaab Autopilots the Books",
      subtitle: "The engine runs double-entry accounting in the background",
      description:
        "Ihsaab maps the entry to GAAP-compliant journal entries, splits sales tax or VAT into your tax reserve, balances your ledger, and recalculates cash flow in milliseconds.",
      icon: Cpu,
      badge: "Double-entry in 0.02s",
      visualText: "Dr. Operating Cash $450 | Cr. Retail Sales $405 | Tax $45",
    },
    {
      number: "03",
      title: "Flawless Financials on Demand",
      subtitle: "Instant P&L, balance sheets, and tax-ready summaries",
      description:
        "Always know your real profit margin and cash runway. When tax season arrives, send a clean, audit-proof export directly to your accountant with a single click.",
      icon: FileCheck,
      badge: "CPA & Tax Ready",
      visualText: "Profit: $13,420 • Margin: 62% • Tax Reserve: $1,340",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border/60 py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Accounting without the headache.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Traditional software forces you to learn accounting. Ihsaab is designed so
            you never have to.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {step.badge}
                    </span>
                  </div>

                  <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {step.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-border/80 bg-muted/40 p-3 font-mono text-xs text-foreground">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                    What happens:
                  </div>
                  <div className="truncate text-foreground/90 font-medium">{step.visualText}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
