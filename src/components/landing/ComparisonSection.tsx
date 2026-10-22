import { Check, X, Sparkles } from "lucide-react";

export function ComparisonSection() {
  const comparisonRows = [
    {
      feature: "Accounting Learning Curve",
      traditional: "Requires courses or accounting background",
      spreadsheets: "Requires custom formulas and accounting skills",
      ihsaab: "Zero learning curve: write what happened",
    },
    {
      feature: "Data Entry Experience",
      traditional: "Tedious journal codes, debit & credit columns",
      spreadsheets: "Manual entry prone to broken cell links",
      ihsaab: "Plain business description + amount",
    },
    {
      feature: "Double-Entry Book Balancing",
      traditional: "Manual reconciliation; easy to be out of balance",
      spreadsheets: "No automatic balancing mechanism",
      ihsaab: "100% automated & mathematically verified",
    },
    {
      feature: "Tax Preparation & Reserves",
      traditional: "Chaotic calculation at year-end",
      spreadsheets: "Manual guessing and formula errors",
      ihsaab: "Automatic tax vault reservation per transaction",
    },
    {
      feature: "Time Spent per Week",
      traditional: "4 - 8 hours of reconciliation headaches",
      spreadsheets: "5+ hours of formula maintenance",
      ihsaab: "Under 10 minutes (just create an entry!)",
    },
    {
      feature: "CPA / Accountant Export",
      traditional: "Messy adjustments needed",
      spreadsheets: "Accountants charge extra to clean up",
      ihsaab: "Instant, standard GAAP financial statements",
    },
  ];

  return (
    <section id="comparison" className="border-t border-border/60 py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            The Difference
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Why SMBs are leaving old accounting behind.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            See how Ihsaab compares to legacy software and fragile spreadsheets.
          </p>
        </div>

        {/* Responsive Table / Card Container */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="p-4 sm:p-5 font-semibold">
                    Core Capability
                  </th>
                  <th scope="col" className="p-4 sm:p-5 font-semibold text-muted-foreground">
                    Legacy Accounting (QuickBooks/Xero)
                  </th>
                  <th scope="col" className="p-4 sm:p-5 font-semibold text-muted-foreground">
                    Excel & Sheets
                  </th>
                  <th
                    scope="col"
                    className="p-4 sm:p-5 font-bold text-primary bg-primary/5 border-l border-primary/20"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-4" />
                      <span>Ihsaab</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={index}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="p-4 sm:p-5 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                          <X className="size-3" />
                        </div>
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                          <X className="size-3" />
                        </div>
                        <span>{row.spreadsheets}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 bg-primary/5 font-medium text-foreground border-l border-primary/20">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                        <span>{row.ihsaab}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
