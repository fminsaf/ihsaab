import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface SimulatorMetricsProps { totalIncome: number; totalExpense: number; netProfit: number; bankBalance: number; autoTaxReserved: number }
export function SimulatorMetrics({ totalIncome, totalExpense, netProfit, bankBalance, autoTaxReserved }: SimulatorMetricsProps) {
  return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Revenue */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Revenue</span>
              <div className="rounded-xl bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Auto-categorized & verified
            </p>
          </div>

          {/* Card 2: Expenses */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Operating Expenses</span>
              <div className="rounded-xl bg-destructive/10 p-1.5 text-destructive">
                <TrendingDown className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${totalExpense.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              100% tax write-off ready
            </p>
          </div>

          {/* Card 3: Net Profit */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Net Profit</span>
              <div className="rounded-xl bg-primary/10 p-1.5 text-primary">
                <DollarSign className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl text-primary">
              ${netProfit.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {totalIncome > 0
                ? `${Math.round((netProfit / totalIncome) * 100)}% margin`
                : "0% margin"}
            </p>
          </div>

          {/* Card 4: Bank & Tax Reserve */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-border">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Cash in Bank</span>
              <div className="rounded-xl bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                <Wallet className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold sm:text-2xl">
              ${bankBalance.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ${autoTaxReserved.toLocaleString()} auto-held for tax
            </p>
          </div>
        </div>

  );
}
