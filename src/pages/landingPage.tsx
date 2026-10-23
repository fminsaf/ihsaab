import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/authProvider";
import supabase from "../lib/supabase";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { ComparisonSection } from "../components/landing/ComparisonSection";
import { FaqSection } from "../components/landing/FaqSection";
import { CtaSection } from "../components/landing/CtaSection";
import { Footer } from "../components/landing/Footer";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Non-authenticated visitors stay on the landing page
      setCheckingRedirect(false);
      return;
    }

    // Authenticated user: redirect away from landing page
    let isMounted = true;
    const userId = user.id;

    async function handleAuthRedirect() {
      try {
        // Always validate against Supabase; cached IDs can point to deleted businesses.
        const { data, error } = await supabase
          .from("businesses")
          .select("id")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!isMounted) return;

        if (!error && data && data.length > 0 && data[0]?.id) {
          const businessId = data[0].id;
          localStorage.setItem("ihsaab_last_bid", businessId);
          localStorage.setItem("last_used_business_id", businessId);
          navigate(`/b/${businessId}`, { replace: true });
        } else {
          localStorage.removeItem("ihsaab_last_bid");
          localStorage.removeItem("last_used_business_id");
          navigate("/create-business", { replace: true });
        }
      } catch {
        if (isMounted) {
          navigate("/create-business", { replace: true });
        }
      }
    }

    handleAuthRedirect();

    return () => {
      isMounted = false;
    };
  }, [user, loading, navigate]);

  // While checking auth status or redirecting, avoid flashing landing page
  if (loading || checkingRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium">Loading Ihsaab...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        {/* Hero Section with Interactive Dashboard UI (No stats bar) */}
        <HeroSection />

        {/* 3-Step "Accounting without doing accounting" workflow */}
        <HowItWorksSection />

        {/* Core Features for SMB owners */}
        <FeaturesSection />

        {/* Ihsaab vs QuickBooks & Spreadsheets Comparison */}
        <ComparisonSection />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Call-to-action */}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
