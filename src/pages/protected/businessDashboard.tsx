import { useParams, Link } from "react-router";
import { Sparkles, Building } from "lucide-react";

const BusinessDashboardPage = () => {
  const { bid } = useParams<{ bid: string }>();

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-2xl">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground text-xs">
                Business ID: {bid}
              </p>
            </div>
          </div>
          <Link
            to="/create-business"
            className="border-border hover:bg-muted inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
          >
            <Building className="size-3.5" />
            <span>Create Another Business</span>
          </Link>
        </div>

        <div className="border-border/80 bg-card rounded-3xl border p-8 text-center">
          <h2 className="text-lg font-bold">
            Welcome to your business dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            All accounting is automated for business{" "}
            <span className="text-foreground font-mono font-semibold">
              {bid}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardPage;
