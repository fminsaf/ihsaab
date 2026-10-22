import { FileSpreadsheet } from "lucide-react";

export default function StatementsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-10 sm:p-16 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <FileSpreadsheet className="size-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground sm:text-xl">
          Audit-Ready Financial Statements
        </h3>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
          One-click Profit & Loss (P&L), Balance Sheet, and Statement of Cash Flows ready for export and CPA review.
        </p>
      </div>
    </div>
  );
}

