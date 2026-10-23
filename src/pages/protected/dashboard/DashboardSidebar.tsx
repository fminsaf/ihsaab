import type { ComponentType, Dispatch, RefObject, SetStateAction } from "react";
import { Link } from "react-router";
import { Sparkles, Building2, X, ChevronDown, Check, Plus, User as UserIcon, Settings, LogOut, ChevronUp } from "lucide-react";
import { ThemeToggle } from "../../../components/ThemeToggle";

export interface BusinessOption { id: string; name: string; currency?: string }
interface NavLink { name: string; href: string; exact: boolean; icon: ComponentType<{ className?: string }> }
interface DashboardSidebarProps {
  bid?: string;
  currentPath: string;
  currentBusinessName: string;
  userEmail?: string;
  businesses: BusinessOption[];
  navLinks: NavLink[];
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
  switcherOpen: boolean;
  setSwitcherOpen: Dispatch<SetStateAction<boolean>>;
  profileMenuOpen: boolean;
  setProfileMenuOpen: Dispatch<SetStateAction<boolean>>;
  switcherRef: RefObject<HTMLDivElement | null>;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  isLoggingOut: boolean;
  onSelectBusiness: (business: BusinessOption) => void;
  onSignOut: () => void;
  isLinkActive: (href: string, exact: boolean) => boolean;
}

export function DashboardSidebar({ bid, currentPath, currentBusinessName, userEmail, businesses, navLinks, mobileSidebarOpen, setMobileSidebarOpen, switcherOpen, setSwitcherOpen, profileMenuOpen, setProfileMenuOpen, switcherRef, profileMenuRef, isLoggingOut, onSelectBusiness, onSignOut, isLinkActive }: DashboardSidebarProps) {
  return (
      <aside
        className={`border-border bg-card fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r transition-transform duration-200 ease-in-out md:h-screen md:translate-x-0 md:overflow-y-auto ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="border-border/80 flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-base font-black tracking-tight">
                Ihsaab
              </span>
              <span className="text-muted-foreground text-[10px] font-medium">
                Accounting on Autopilot
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Business Switcher Dropdown */}
        <div className="border-border/80 border-b p-3" ref={switcherRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="border-border bg-muted/30 text-foreground hover:bg-muted/70 flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition focus:outline-none"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-lg">
                  <Building2 className="size-3.5" />
                </div>
                <span className="truncate">{currentBusinessName}</span>
              </div>
              <ChevronDown
                className={`text-muted-foreground size-3.5 shrink-0 transition-transform ${
                  switcherOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {switcherOpen && (
              <div className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1.5 rounded-2xl border p-1.5 shadow-xl">
                <div className="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                  Switch Business
                </div>
                <div className="max-h-48 space-y-0.5 overflow-y-auto">
                  {businesses.map((b) => {
                    const isSelected = b.id === bid;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelectBusiness(b)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {isSelected && <Check className="size-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-border mt-1 border-t pt-1">
                  <Link
                    to="/create-business"
                    onClick={() => setSwitcherOpen(false)}
                    className="text-primary hover:bg-primary/10 flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition"
                  >
                    <Plus className="size-3.5" />
                    <span>Create New Business</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Dashboard Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <div className="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
            Dashboard
          </div>
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const active = isLinkActive(tab.href, tab.exact);
            return (
              <Link
                key={tab.name}
                to={tab.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Business Settings + Personal Profile Card */}
        <div
          className="border-border/80 relative space-y-2 border-t p-3"
          ref={profileMenuRef}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">Appearance</span>
            <ThemeToggle className="size-9" />
          </div>
          {/* Business Settings Link */}
          <div>
            <Link
              to={`/b/${bid}/settings`}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                currentPath.startsWith(`/b/${bid}/settings`)
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Building2 className="size-4 shrink-0" />
              <span className="truncate">Business Settings</span>
            </Link>
          </div>

          {/* Profile Card Popup Menu */}
          {profileMenuOpen && (
            <div className="border-border bg-popover absolute right-3 bottom-full left-3 z-50 mb-2 rounded-2xl border p-1.5 shadow-xl">
              <div className="border-border border-b px-3 py-2">
                <p className="text-foreground truncate text-xs font-semibold">
                  {userEmail || "Account"}
                </p>
                <p className="text-muted-foreground truncate text-[10px]">
                  Signed in
                </p>
              </div>

              <div className="space-y-0.5 py-1">
                <Link
                  to={`/b/${bid}/account`}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs transition ${
                    currentPath.startsWith(`/b/${bid}/account`)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Settings className="size-3.5 shrink-0" />
                  <span>Personal Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={isLoggingOut}
                  className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs transition disabled:opacity-50"
                >
                  <LogOut className="size-3.5 shrink-0" />
                  <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Personal Profile Card */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`flex w-full items-center justify-between rounded-2xl p-2 text-left transition ${
              profileMenuOpen || currentPath.startsWith(`/b/${bid}/account`)
                ? "bg-muted text-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-xl">
                <UserIcon className="size-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-[11px] font-bold">
                  {userEmail?.split("@")[0] || "Account"}
                </p>
                <p className="text-muted-foreground truncate text-[9px]">
                  {userEmail || "Personal Profile"}
                </p>
              </div>
            </div>

            {profileMenuOpen ? (
              <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
            ) : (
              <ChevronUp className="text-muted-foreground size-3.5 shrink-0" />
            )}
          </button>
        </div>
      </aside>
  );
}
