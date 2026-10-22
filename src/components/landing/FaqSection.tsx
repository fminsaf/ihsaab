import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Do I need to know debit, credit, or accounting terms?",
      answer:
        "Not at all. That is the core promise of Ihsaab. You simply create an entry describing what you bought or sold (for example, 'Sold 5 custom cakes for $300' or 'Paid electricity bill $150'). Ihsaab's engine automatically determines the correct double-entry accounts, balances the ledger, and records the math behind the scenes.",
    },
    {
      question: "Will my accountant or CPA be able to work with Ihsaab?",
      answer:
        "Yes, CPAs love Ihsaab. While you interact with a friendly, jargon-free interface, the underlying database strictly maintains GAAP-compliant General Ledgers, Profit & Loss statements, and Balance Sheets. You can export complete CPA-ready financial statements with one click anytime.",
    },
    {
      question: "How does the Automated Tax Vault work?",
      answer:
        "Whenever you record an income or expense entry, Ihsaab instantly calculates the relevant tax proportion (sales tax, VAT, or income tax reserve) and segregates it in your dashboard metrics. This ensures you always know your true spendable cash versus tax obligations.",
    },
    {
      question: "What if I make a mistake or need to adjust an entry?",
      answer:
        "You can edit or void any entry at any time with a single tap. Ihsaab will automatically adjust the corresponding double-entry journals, reverse the tax segregation, and update your financial statements synchronously.",
    },
    {
      question: "Is my business data secure and private?",
      answer:
        "Absolutely. Ihsaab utilizes bank-grade 256-bit encryption in transit and at rest, powered by Supabase infrastructure with granular Row Level Security (RLS). Only authenticated members of your business can ever access your records.",
    },
    {
      question: "Can I use Ihsaab on my smartphone or tablet?",
      answer:
        "Yes! Ihsaab is 100% responsive. Many shop owners, cafe managers, and on-site contractors keep Ihsaab open on their mobile phone or iPad counter to record sales and bills on the spot in seconds.",
    },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Frequently Asked Questions
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Everything you need to know.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Have questions about how Ihsaab takes care of your books? We've got answers.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-3xl border border-border/80 bg-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground hover:bg-muted/30"
                  aria-expanded={isOpen}
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/60 px-6 pt-3 pb-6 text-sm leading-relaxed text-muted-foreground bg-muted/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
