import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqContent } from "../../data/landingContent";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {faqContent.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {faqContent.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {faqContent.description}
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqContent.faqs.map((faq, index) => {
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
