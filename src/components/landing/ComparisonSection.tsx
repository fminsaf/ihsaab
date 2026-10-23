import { Check, X, Sparkles } from "lucide-react";
import { comparisonContent } from "../../data/landingContent";

export function ComparisonSection() {
  return (
    <section id="comparison" className="border-t border-border/60 py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {comparisonContent.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {comparisonContent.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {comparisonContent.description}
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
                {comparisonContent.rows.map((row, index) => (
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
