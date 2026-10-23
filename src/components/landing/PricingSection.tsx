import { useState } from "react";
import { Link } from "react-router";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { pricingContent } from "../../data/landingContent";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const isYearly = billingCycle === "yearly";

  return (
    <section id="pricing" className="border-t border-border/60 py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {pricingContent.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {pricingContent.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {pricingContent.description}
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-border bg-background p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                !isYearly
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pricingContent.billingOptions.monthly}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                isYearly
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{pricingContent.billingOptions.yearly}</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-300">
                {pricingContent.billingOptions.yearlySavings}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative rounded-3xl border-2 border-primary/40 bg-card p-8 shadow-xl sm:p-10">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                <Sparkles className="size-3.5" />
                <span>SMB All-Inclusive Plan</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-border/80 pb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  {pricingContent.planName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pricingContent.planDescription}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                    {isYearly ? pricingContent.prices.yearly : pricingContent.prices.monthly}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {isYearly ? "/ year" : "/ month"}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {isYearly ? pricingContent.billingNotes.yearly : pricingContent.billingNotes.monthly}
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {pricingContent.includedHeading}
              </h4>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                {pricingContent.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                    <span className="text-foreground/90 leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Link
                to="/auth/sign-up"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-center text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:scale-[1.01]"
              >
                <span>{pricingContent.trialAction}</span>
                <ArrowRight className="size-4" />
              </Link>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {pricingContent.trialNotes.map((note) => <span key={note}>✓ {note}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

