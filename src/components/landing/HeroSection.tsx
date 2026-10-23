import { Link } from "react-router";
import { InteractiveHeroDashboard } from "./InteractiveHeroDashboard";
import { ArrowRight, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { heroContent } from "../../data/landingContent";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-20">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/15 via-emerald-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Top Copy */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-4 py-1.5 text-xs font-semibold text-foreground backdrop-blur-xs transition hover:border-primary/50">
            <Sparkles className="size-3.5 text-primary" />
            <span>{heroContent.audience}</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="hidden font-normal text-muted-foreground sm:inline">
              {heroContent.promise}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl sm:leading-[1.12]">
            {heroContent.headline}{" "}
            <span className="bg-gradient-to-r from-primary via-primary/85 to-emerald-600 bg-clip-text text-transparent">
              {heroContent.headlineEmphasis}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-8">
            {heroContent.description}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth/sign-up"
                id="hero-primary-action"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02]"
              >
                <span>{heroContent.primaryAction}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/auth/sign-in"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                <span>{heroContent.signInAction}</span>
              </Link>
            </div>

            {/* Micro Guarantees */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {heroContent.assurances.map((assurance) => <span key={assurance} className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                {assurance}
              </span>)}
            </div>
          </div>
        </div>

        {/* Hero Interactive Dashboard UI */}
        <div className="mt-12 sm:mt-16">
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" />
              {heroContent.demoLabel}
            </span>
          </div>

          {/* Interactive UI Container */}
          <InteractiveHeroDashboard />
        </div>
      </div>
    </section>
  );
}
