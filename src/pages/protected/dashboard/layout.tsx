import { useEffect, useState, useRef } from "react";
import { NewTransactionDialog } from "../../../components/transactions/NewTransactionDialog";
import { DashboardSidebar, type BusinessOption } from "./DashboardSidebar";
import { useParams, useNavigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../../../auth/authProvider";
import supabase from "../../../lib/supabase";
import { toast } from "../../../components/ui/toast";
import {
  Menu,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  BookOpen,
  BookText,
  Boxes,
  FileSpreadsheet,
} from "lucide-react";

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
  const [currentBusinessCurrency, setCurrentBusinessCurrency] = useState("USD");
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
            if (found.currency) setCurrentBusinessCurrency(found.currency);
          } else if (bid) {
            setCurrentBusinessName(data[0].name);
            if (data[0].currency) setCurrentBusinessCurrency(data[0].currency);
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
    setCurrentBusinessCurrency(b.currency || "USD");
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
      name: "Transactions",
      href: `/b/${bid}/transactions`,
      exact: false,
      icon: ArrowLeftRight,
    },
    {
      name: "General Ledger",
      href: `/b/${bid}/general-ledger`,
      exact: false,
      icon: BookText,
    },
    {
      name: "Accounts",
      href: `/b/${bid}/accounts`,
      exact: false,
      icon: BookOpen,
    },
    {
      name: "Financial Statements",
      href: `/b/${bid}/statements`,
      exact: false,
      icon: FileSpreadsheet,
    },
    {
      name: "Contacts",
      href: `/b/${bid}/contacts`,
      exact: false,
      icon: Users,
    },
    {
      name: "Inventory",
      href: `/b/${bid}/inventory`,
      exact: false,
      icon: Boxes,
    },
  ];

  // Helper to determine active state
  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return location.pathname === href || location.pathname === `${href}/`;
    }
    return location.pathname.startsWith(href);
  };

  const currentPath = location.pathname;
  const isOverview =
    currentPath === `/b/${bid}` || currentPath === `/b/${bid}/`;
  const isGeneralLedger =
    currentPath.startsWith(`/b/${bid}/general-ledger`) ||
    currentPath.startsWith(`/b/${bid}/ledgers`);
  const isAccounts = currentPath.startsWith(`/b/${bid}/accounts`);

  // Header Title & Description
  const getHeaderInfo = () => {
    if (isOverview) {
      return {
        title: "Overview",
        description: "Summary of your cash balances, revenue, and expenses.",
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
        description:
          "Manage customers and vendors, and see their transactions.",
      };
    }
    if (isGeneralLedger) {
      return {
        title: "General Ledger",
        description:
          "Every posted transaction and its debit and credit entries.",
      };
    }
    if (isAccounts) {
      return {
        title: "Accounts",
        description:
          "Review account balances and debit or credit activity by category.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/inventory`)) {
      return {
        title: "Inventory",
        description: "Manage products, stock, and item prices.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/statements`)) {
      return {
        title: "Financial Statements",
        description:
          "Profit & Loss, Balance Sheet, Cash Flow, and Trial Balance.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/settings`)) {
      return {
        title: "Business Settings",
        description: `Configuration for ${currentBusinessName}.`,
      };
    }
    if (currentPath.startsWith(`/b/${bid}/help`)) {
      return {
        title: "Help & getting started",
        description:
          "Learn how to record entries and review your business books.",
      };
    }
    if (currentPath.startsWith(`/b/${bid}/feedback`)) {
      return {
        title: "Feedback",
        description: "Share your experience and help improve Ihsaab.",
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

      <DashboardSidebar
        bid={bid}
        currentPath={currentPath}
        currentBusinessName={currentBusinessName}
        userEmail={user?.email}
        businesses={businesses}
        navLinks={navLinks}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        switcherOpen={switcherOpen}
        setSwitcherOpen={setSwitcherOpen}
        profileMenuOpen={profileMenuOpen}
        setProfileMenuOpen={setProfileMenuOpen}
        switcherRef={switcherRef}
        profileMenuRef={profileMenuRef}
        isLoggingOut={isLoggingOut}
        onSelectBusiness={handleSelectBusiness}
        onSignOut={handleSignOut}
        isLinkActive={isLinkActive}
        onNewEntry={() => setNewEntryOpen(true)}
      />

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

          <div />
        </header>

        {/* Sub-page Outlet */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet
            context={{
              bid,
              currentBusinessName,
              currentBusinessCurrency,
              setNewEntryOpen,
            }}
          />
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
