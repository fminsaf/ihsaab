import { Link } from "react-router";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { ctaContent } from "../../data/landingContent";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-primary text-primary-foreground">
      {/* Background radial accent */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-xs">
          <Sparkles className="size-3.5" />
          <span>{ctaContent.eyebrow}</span>
        </div>

        <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
          {ctaContent.title}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
          {ctaContent.description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-bold text-foreground shadow-xl transition-all duration-200 hover:scale-105 hover:bg-background/95"
          >
            <span>{ctaContent.primaryAction}</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10"
          >
            <span>{ctaContent.signInAction}</span>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/80">
          {ctaContent.assurances.map((assurance) => <span key={assurance} className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-300" />
            {assurance}
          </span>)}
        </div>
      </div>
    </section>
  );
}
