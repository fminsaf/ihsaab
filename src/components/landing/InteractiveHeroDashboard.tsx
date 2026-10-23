import { useMemo, useState } from "react";
import { BUSINESS_PROFILES } from "../../data/heroDemo";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookText,
  Boxes,
  FileText,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";

const monthWeights = [0.12, 0.15, 0.1, 0.19, 0.16, 0.28];
const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export function InteractiveHeroDashboard() {
  const [profileId, setProfileId] = useState("cafe");
  const profile =
    BUSINESS_PROFILES.find((item) => item.id === profileId) ??
    BUSINESS_PROFILES[0];
  const { income, expenses, byCategory } = useMemo(() => {
    const income = profile.startingTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = profile.startingTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const byCategory = profile.startingTransactions
      .filter((tx) => tx.type === "expense")
      .reduce<Record<string, number>>((result, tx) => {
        result[tx.category] = (result[tx.category] || 0) + tx.amount;
        return result;
      }, {});
    return { income, expenses, byCategory };
  }, [profile]);
  const net = income - expenses;
  const chartMax = Math.max(income, expenses, 1);
  const ProfileIcon = profile.icon;
  const metrics = [
    {
      label: "Income · sample",
      value: income,
      icon: ArrowUpRight,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Expenses · sample",
      value: expenses,
      icon: ArrowDownRight,
      tone: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Net profit · sample",
      value: net,
      icon: FileText,
      tone:
        net >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-destructive",
    },
    {
      label: "Cash & bank · example",
      value: 14500 + net,
      icon: Wallet,
      tone: "text-primary",
    },
  ];

  return (
    <div className="border-border/70 bg-card text-card-foreground relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border shadow-2xl">
      <div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground ml-2 text-xs font-semibold">
            Sample workspace
          </span>
        </div>
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          Example business
          <select
            aria-label="Choose sample business"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
            className="border-border bg-background text-foreground max-w-36 rounded-lg border px-2 py-1.5 font-medium"
          >
            {BUSINESS_PROFILES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <span className="border-primary/20 bg-primary/5 text-primary rounded-full border px-2.5 py-1 text-[10px] font-semibold">
          BETA PREVIEW
        </span>
      </div>

      <div className="grid min-h-[430px] md:grid-cols-[150px_1fr]">
        <aside className="border-border/60 bg-muted/10 hidden border-r p-3 md:block">
          <div className="mb-5 flex items-center gap-2 px-2 pt-1">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
              <span className="text-xs font-bold">i</span>
            </span>
            <span className="text-sm font-bold">Ihsaab</span>
          </div>
          {[
            { label: "Overview", icon: LayoutDashboard, active: true },
            { label: "Transactions", icon: ReceiptText },
            { label: "General Ledger", icon: BookText },
            { label: "Accounts", icon: BookText },
            { label: "Statements", icon: FileText },
            { label: "Inventory", icon: Boxes },
          ].map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Icon className="size-3.5" />
              {label}
            </div>
          ))}
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                <ProfileIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Overview</h3>
                <p className="text-muted-foreground text-[11px]">
                  {profile.name} · example data only
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("hero-primary-action")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              Try Ihsaab
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="border-border/70 bg-background rounded-xl border p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span className="text-muted-foreground text-[10px] leading-tight font-medium">
                    {label}
                  </span>
                  <Icon className={`size-3.5 shrink-0 ${tone}`} />
                </div>
                <div className="text-base font-bold tracking-tight sm:text-lg">
                  {money(value)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <section className="border-border/70 bg-background rounded-xl border p-3.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold">Income and expenses</h4>
                  <p className="text-muted-foreground text-[10px]">
                    Illustrative monthly activity
                  </p>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  Last 6 months
                </span>
              </div>
              <div className="border-border/70 flex h-28 items-end justify-between gap-2 border-b pb-1">
                {months.map((month, index) => (
                  <div
                    key={month}
                    className="flex h-full flex-1 items-end justify-center gap-1"
                  >
                    <div
                      title={`Income ${money(income * monthWeights[index])}`}
                      className="bg-primary/80 w-2.5 rounded-t"
                      style={{
                        height: `${Math.max(5, ((income * monthWeights[index]) / chartMax) * 86)}%`,
                      }}
                    />
                    <div
                      title={`Expenses ${money(expenses * monthWeights[index])}`}
                      className="w-2.5 rounded-t bg-orange-400/80"
                      style={{
                        height: `${Math.max(5, ((expenses * monthWeights[index]) / chartMax) * 86)}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-[9px]">
                {months.map((month) => (
                  <span key={month} className="flex-1 text-center">
                    {month}
                  </span>
                ))}
              </div>
              <div className="text-muted-foreground mt-3 flex gap-4 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <i className="bg-primary/80 size-2 rounded-sm" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-sm bg-orange-400/80" />
                  Expenses
                </span>
              </div>
            </section>
            <section className="border-border/70 bg-background rounded-xl border p-3.5 sm:p-4">
              <h4 className="text-xs font-semibold">Top expenses</h4>
              <p className="text-muted-foreground mb-3 text-[10px]">
                From example entries
              </p>
              <div className="space-y-3">
                {Object.entries(byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, amount]) => (
                    <div key={category}>
                      <div className="mb-1 flex justify-between gap-2 text-[10px]">
                        <span className="text-muted-foreground truncate">
                          {category}
                        </span>
                        <span className="font-semibold">{money(amount)}</span>
                      </div>
                      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-primary/70 h-full rounded-full"
                          style={{
                            width: `${Math.max(8, (amount / Math.max(expenses, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="bg-muted/50 mt-4 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[10px]">
                  Net margin · sample
                </p>
                <p className="mt-0.5 text-sm font-bold">
                  {income ? `${Math.round((net / income) * 100)}%` : "—"}
                </p>
              </div>
            </section>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-[10px]">
            Illustrative figures for preview only. Your dashboard uses your
            recorded business entries.
          </p>
        </div>
      </div>
    </div>
  );
}
