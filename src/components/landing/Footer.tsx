import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import { footerContent } from "../../data/landingContent";

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
              {footerContent.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span>{footerContent.status}</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {footerContent.productHeading}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {footerContent.productLinks.map((link) => <li key={link.href}><a href={link.href} className="transition hover:text-foreground">{link.label}</a></li>)}
            </ul>
          </div>

          {/* Security & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {footerContent.startHeading}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {footerContent.startLinks.map((link) => <li key={link.href}>{link.internal ? <Link to={link.href} className="transition hover:text-foreground">{link.label}</Link> : <a href={link.href} className="transition hover:text-foreground">{link.label}</a>}</li>)}
              <li>
                <span className="text-xs text-muted-foreground/80">
                  {footerContent.compliance}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} {footerContent.copyright}</p>
          <div className="flex gap-4">
            {footerContent.legalLinks.map((label, index) => <span key={label} className="contents">{index > 0 && <span>•</span>}<span className="hover:text-foreground cursor-pointer">{label}</span></span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
