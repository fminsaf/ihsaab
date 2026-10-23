import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, ArrowRight } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { navbarContent } from "../../data/landingContent";
import { ThemeToggle } from "../ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <BrandLogo className="size-9 transition-transform duration-200 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-foreground text-xl font-black tracking-tight">
              Ihsaab
            </span>
            <span className="text-muted-foreground hidden text-[10px] font-medium tracking-wide sm:inline-block">
              {navbarContent.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navbarContent.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            to="/auth/sign-in"
            className="text-muted-foreground hover:text-foreground rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            {navbarContent.signIn}
          </Link>
          <Link
            to="/auth/sign-up"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02]"
          >
            <span>{navbarContent.desktopAction}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:bg-muted inline-flex items-center justify-center rounded-full p-2.5 focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label={navbarContent.menuLabel}
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-border bg-background border-b px-4 pt-2 pb-6 md:hidden">
          <div className="flex flex-col space-y-2 py-2">
            {navbarContent.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:bg-muted rounded-2xl px-4 py-2.5 text-base font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="border-border mt-4 flex flex-col gap-2.5 border-t pt-4">
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            <Link
              to="/auth/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="border-border text-foreground hover:bg-muted w-full rounded-full border px-4 py-2.5 text-center text-sm font-medium"
            >
              {navbarContent.signIn}
            </Link>
            <Link
              to="/auth/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold shadow"
            >
              <span>{navbarContent.mobileAction}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
