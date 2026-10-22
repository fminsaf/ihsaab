import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { useAuth } from "../../auth/authProvider";
import supabase from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { toast } from "../../components/ui/toast";
import {
  Sparkles,
  LogOut,
  ArrowRight,
  User as UserIcon,
  Building,
  Loader2,
} from "lucide-react";

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);
    if (error) {
      toast.add({
        description: error.message,
        type: "error",
      });
    } else {
      toast.add({
        description: "You have been logged out successfully.",
        type: "success",
      });
    }
  };

  const handleContinueToApp = () => {
    const cachedBid =
      localStorage.getItem("ihsaab_last_bid") ||
      localStorage.getItem("last_used_business_id");
    if (cachedBid) {
      navigate(`/b/${cachedBid}`);
    } else {
      navigate("/create-business");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs font-medium">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/10 via-emerald-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Brand Header */}
      <Link
        to="/"
        className="group mb-8 flex items-center gap-2.5 transition-transform hover:scale-105"
      >
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-foreground">
            Ihsaab
          </span>
          <span className="text-[10px] text-muted-foreground">
            Accounting on Autopilot
          </span>
        </div>
      </Link>

      {/* Authenticated State vs Guest Outlet */}
      {user ? (
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <UserIcon className="size-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
            Active Session Detected
          </span>

          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Already signed in
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You are currently authenticated as:
          </p>

          <div className="mt-3 rounded-2xl border border-border/80 bg-muted/40 p-3 font-mono text-xs font-semibold text-foreground truncate">
            {user.email}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              size="default"
              onClick={handleContinueToApp}
              className="w-full"
            >
              <Building className="size-4" />
              <span>Continue to Business Dashboard</span>
              <ArrowRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={isLoggingOut}
              onClick={handleSignOut}
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  <span>Log Out of this Account</span>
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link
              to="/"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
            >
              ← Back to Landing Page
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
