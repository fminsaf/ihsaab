import { useEffect, useState, useRef } from "react";
import { NewTransactionDialog } from "../../../components/transactions/NewTransactionDialog";
import {
  useParams,
  useNavigate,
  useLocation,
  Link,
  Outlet,
} from "react-router";
import { useAuth } from "../../../auth/authProvider";
import supabase from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import { toast } from "../../../components/ui/toast";
import {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Users,
  BookOpen,
  FileSpreadsheet,
  Building2,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

interface BusinessOption {
  id: string;
  name: string;
  currency?: string;
}

export default function BusinessDashboardLayout() {
  const { bid } = useParams<{ bid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [currentBusinessName, setCurrentBusinessName] =
    useState<string>("My Business");
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
        setSwitcherOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch businesses for switcher
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function fetchBusinesses() {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, currency")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (!error && data && data.length > 0) {
          setBusinesses(data);
          const found = data.find((b) => b.id === bid);
          if (found) {
            setCurrentBusinessName(found.name);
          } else if (bid) {
            setCurrentBusinessName(data[0].name);
          }
        } else {
          setBusinesses([{ id: bid || "default", name: "My Business" }]);
          setCurrentBusinessName("My Business");
        }
      } catch {
        if (isMounted) {
          setBusinesses([{ id: bid || "default", name: "My Business" }]);
          setCurrentBusinessName("My Business");
        }
      }
    }

    fetchBusinesses();

    if (bid) {
      localStorage.setItem("last_used_business_id", bid);
      localStorage.setItem("ihsaab_last_bid", bid);
    }

    return () => {
      isMounted = false;
    };
  }, [user, bid]);

  const handleSelectBusiness = (b: BusinessOption) => {
    setSwitcherOpen(false);
    setCurrentBusinessName(b.name);
    // Keep relative route suffix if applicable, or go to root of business
    const suffix = location.pathname.split(`/b/${bid}`)[1] || "";
    navigate(`/b/${b.id}${suffix}`);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setProfileMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);
    if (error) {
      toast.add({ description: error.message, type: "error" });
    } else {
      toast.add({ description: "Signed out successfully.", type: "success" });
      navigate("/");
    }
  };

  const navLinks = [
    {
      name: "Overview",
      href: `/b/${bid}`,
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: "Charts",
      href: `/b/${bid}/charts`,
      exact: false,
      icon: BarChart3,
    },
    {
      name: "Transactions",
      href: `/b/${bid}/transactions`,
      exact: false,
      icon: ArrowLeftRight,
    },
    {
      name: "Contacts",
      href: `/b/${bid}/contacts`,
      exact: false,
      icon: Users,
    },
    {
      name: "Books",
      href: `/b/${bid}/books`,
      exact: false,
      icon: BookOpen,
    },
    {
      name: "Financial Statements",
      href: `/b/${bid}/statements`,
      exact: false,
      icon: FileSpreadsheet,
    },
  ];

  // Helper to determine active state
  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return location.pathname === href || location.pathname === `${href}/`;
    }
    return location.pathname.startsWith(href);
  };

  // Check if current route should display "+ New Entry" button
  const currentPath = location.pathname;
  const isOverview =
    currentPath === `/b/${bid}` || currentPath === `/b/${bid}/`;
  const isTransactions = currentPath.startsWith(`/b/${bid}/transactions`);
  const isBooks = currentPath.startsWith(`/b/${bid}/books`);
  const showNewEntryButton = isOverview || isTransactions || isBooks;

  // Header Title & Description
  const getHeaderInfo = () => {
    if (isOverview) {
      return {
        title: "Overview",
        description: "Summary of your cash balances, revenue, and expenses.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/charts`)) {
      return {
        title: "Charts & Analytics",
        description: "Visual breakdown of income, expenses, and trends.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/transactions`)) {
      return {
        title: "Transactions",
        description: "View and filter all recorded business transactions.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/contacts`)) {
      return {
        title: "Contacts",
        description: "Manage customers and vendors, and see their transactions.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/books`)) {
      return {
        title: "Books & Chart of Accounts",
        description: "Chart of accounts and general ledger balances.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/statements`)) {
      return {
        title: "Financial Statements",
        description: "Profit & Loss and Balance Sheet statements.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/settings`)) {
      return {
        title: "Business Settings",
        description: `Configuration for ${currentBusinessName}.`,
      };
    }
    if (currentPath.startsWith(`/b/${bid}/account`)) {
      return {
        title: "Personal Account Settings",
        description: "Manage your profile, email, and credentials.",
      };
    }
    return { title: "Dashboard", description: currentBusinessName };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex min-h-screen antialiased">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
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
                        onClick={() => handleSelectBusiness(b)}
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
                  {user?.email || "Account"}
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
                  onClick={handleSignOut}
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
                  {user?.email?.split("@")[0] || "Account"}
                </p>
                <p className="text-muted-foreground truncate text-[9px]">
                  {user?.email || "Personal Profile"}
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

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        {/* Top Header Bar */}
        <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="text-foreground hover:bg-muted rounded-lg p-1.5 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>

            <div>
              <h1 className="text-foreground text-base font-bold sm:text-lg">
                {headerInfo.title}
              </h1>
              <p className="text-muted-foreground hidden text-xs sm:block">
                {currentBusinessName} • {headerInfo.description}
              </p>
            </div>
          </div>

          {/* New Entry Button: Only in operational tabs */}
          <div className="flex items-center gap-2">
            {showNewEntryButton && (
              <Button
                size="sm"
                onClick={() => setNewEntryOpen(true)}
                className="gap-1.5 rounded-full"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">Entry</span>
              </Button>
            )}
          </div>
        </header>

        {/* Sub-page Outlet */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ bid, currentBusinessName, setNewEntryOpen }} />
        </main>
      </div>

      {/* Transaction Entry Dialog */}
      {bid && (
        <NewTransactionDialog
          open={newEntryOpen}
          onOpenChange={setNewEntryOpen}
          businessId={bid}
        />
      )}
    </div>
  );
}
