import { Link } from "react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card py-12 text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Ihsaab
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              The modern accounting application for small business owners. Do accounting
              without doing accounting. Simply create an entry—Ihsaab handles the rest.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span>All systems operational • 256-bit SSL secured</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#demo" className="transition hover:text-foreground">
                  Interactive Simulator
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="transition hover:text-foreground">
                  Features for SMBs
                </a>
              </li>
              <li>
                <a href="#comparison" className="transition hover:text-foreground">
                  Ihsaab vs QuickBooks
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition hover:text-foreground">
                  Pricing ($100/mo or $1000/yr)
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Get Started
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth/sign-up" className="transition hover:text-foreground">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-in" className="transition hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <a href="#faq" className="transition hover:text-foreground">
                  FAQ & Support
                </a>
              </li>
              <li>
                <span className="text-xs text-muted-foreground/80">
                  GAAP & IFRS Compliant
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} Ihsaab Inc. Built for small business owners worldwide.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
