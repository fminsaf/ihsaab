import {
  Cpu,
  FileCheck,
  FileSpreadsheet,
  MessageSquareCheck,
  PiggyBank,
  PlusCircle,
  Receipt,
  Smartphone,
  TrendingUp,
} from "lucide-react"

export const heroContent = {
  audience: "Built exclusively for SMB owners & founders",
  promise: "Zero debits or credits required",
  headline: "Do your accounting",
  headlineEmphasis: "without doing accounting.",
  description:
    "You started a business to build something great—not to babysit spreadsheets, reconcile bank lines, or decipher double-entry codes. Just create a new entry in Ihsaab, and our automated engine handles the rest.",
  primaryAction: "Start Free Now",
  signInAction: "Sign In",
  assurances: ["No credit card needed", "Setup in under 60 seconds", "14-day free trial"],
  demoLabel: "Live Interactive Hero Sandbox: Try it right now!",
}

export const featureSectionContent = {
  eyebrow: "Built for Small Business",
  title: "Everything your business needs. Nothing you don't.",
  description:
    "Big enterprise accounting software is bloated and confusing. Ihsaab gives SMB owners complete financial mastery with zero friction.",
  features: [
    {
      icon: MessageSquareCheck,
      title: "Zero-Jargon Bookkeeping",
      description:
        "No complex charts of accounts, no debit/credit rules. Type 'Bought supplies for $80' and Ihsaab knows exactly which ledger accounts to touch.",
    },
    {
      icon: PiggyBank,
      title: "Automated Tax Vault",
      description:
        "Ihsaab automatically estimates and isolates your sales tax and income tax provisions with every entry so you never face a terrifying year-end tax bill.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Cash Runway",
      description:
        "Instantly know how much real profit you made this month and how many weeks of operating expenses your bank balance covers.",
    },
    {
      icon: Receipt,
      title: "Smart Invoicing & Tracking",
      description:
        "Create branded invoices in seconds. Once a client pays, the invoice automatically reconciles into your revenue accounts without manual matching.",
    },
    {
      icon: FileSpreadsheet,
      title: "1-Click CPA Export",
      description:
        "Your accountant will love you. When tax season hits, export GAAP-compliant Balance Sheets, P&Ls, and General Ledgers with one click.",
    },
    {
      icon: Smartphone,
      title: "Responsive On-The-Go Access",
      description:
        "Log a coffee shop sale, retail transaction, or vendor payment right from your phone behind the counter or while on a client site.",
    },
  ],
  securityTitle: "Bank-Grade 256-Bit Encryption & Automated Daily Backups",
  securityDescription:
    "Your financial data is private, encrypted, and isolated with Row Level Security.",
  uptime: "99.99% Uptime",
}

export const howItWorksContent = {
  eyebrow: "How It Works",
  title: "Accounting without the headache.",
  description: "Traditional software forces you to learn accounting. Ihsaab is designed so you never have to.",
  steps: [
    {
      number: "01",
      title: "Record What Happened",
      subtitle: "Just describe the transaction in plain human English",
      description:
        "Forget chart of accounts, debit/credit rules, or ledger codes. When you make a sale or pay an invoice, just record the amount and what it was for.",
      icon: PlusCircle,
      badge: "No accounting jargon",
      visualText: "Sold 10 artisan ceramics for $450 via card",
    },
    {
      number: "02",
      title: "Ihsaab Autopilots the Books",
      subtitle: "The engine runs double-entry accounting in the background",
      description:
        "Ihsaab maps the entry to GAAP-compliant journal entries, splits sales tax or VAT into your tax reserve, balances your ledger, and recalculates cash flow in milliseconds.",
      icon: Cpu,
      badge: "Double-entry in 0.02s",
      visualText: "Dr. Operating Cash $450 | Cr. Retail Sales $405 | Tax $45",
    },
    {
      number: "03",
      title: "Flawless Financials on Demand",
      subtitle: "Instant P&L, balance sheets, and tax-ready summaries",
      description:
        "Always know your real profit margin and cash runway. When tax season arrives, send a clean, audit-proof export directly to your accountant with a single click.",
      icon: FileCheck,
      badge: "CPA & Tax Ready",
      visualText: "Profit: $13,420 • Margin: 62% • Tax Reserve: $1,340",
    },
  ],
  whatHappens: "What happens:",
}

export const pricingContent = {
  eyebrow: "Simple, Transparent Pricing",
  title: "One simple plan. Everything included.",
  description:
    "No hidden tiers, no surprise add-on charges. Total accounting peace of mind for your business.",
  features: [
    "Unlimited business entries & transactions",
    "Automated GAAP double-entry ledger engine",
    "Real-time Automated Tax Vault & segregation",
    "Instant Profit & Loss, Balance Sheet, & Cash Flow",
    "1-Click CPA and Tax Accountant export package",
    "Smart Invoicing & automated payment reconciliation",
    "Multi-device sync (iPhone, Android, iPad, Desktop)",
    "Document & receipt attachment storage",
    "Bank-grade 256-bit encryption & automated backups",
    "Priority SMB customer support",
  ],
  planName: "Ihsaab Complete",
  planDescription: "Everything an SMB needs to do accounting without doing accounting.",
  billingOptions: { monthly: "Monthly Billing", yearly: "Annual Billing", yearlySavings: "Save $200 / yr" },
  prices: { monthly: "$100", yearly: "$1,000" },
  billingNotes: { monthly: "Billed monthly, cancel anytime", yearly: "Equivalent to $83.33/mo (Billed annually)" },
  includedHeading: "Everything Included In Your Plan:",
  trialAction: "Start 14-Day Free Trial",
  trialNotes: ["14 days free full access", "No credit card required upfront", "Cancel anytime in 1 click"],
}

export const faqContent = {
  eyebrow: "Frequently Asked Questions",
  title: "Everything you need to know.",
  description: "Have questions about how Ihsaab takes care of your books? We've got answers.",
  faqs: [
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
  ],
}

export const comparisonContent = {
  eyebrow: "The Difference",
  title: "Why SMBs are leaving old accounting behind.",
  description: "See how Ihsaab compares to legacy software and fragile spreadsheets.",
  rows: [
    { feature: "Accounting Learning Curve", traditional: "Requires courses or accounting background", spreadsheets: "Requires custom formulas and accounting skills", ihsaab: "Zero learning curve: write what happened" },
    { feature: "Data Entry Experience", traditional: "Tedious journal codes, debit & credit columns", spreadsheets: "Manual entry prone to broken cell links", ihsaab: "Plain business description + amount" },
    { feature: "Double-Entry Book Balancing", traditional: "Manual reconciliation; easy to be out of balance", spreadsheets: "No automatic balancing mechanism", ihsaab: "100% automated & mathematically verified" },
    { feature: "Tax Preparation & Reserves", traditional: "Chaotic calculation at year-end", spreadsheets: "Manual guessing and formula errors", ihsaab: "Automatic tax vault reservation per transaction" },
    { feature: "Time Spent per Week", traditional: "4 - 8 hours of reconciliation headaches", spreadsheets: "5+ hours of formula maintenance", ihsaab: "Under 10 minutes (just create an entry!)" },
    { feature: "CPA / Accountant Export", traditional: "Messy adjustments needed", spreadsheets: "Accountants charge extra to clean up", ihsaab: "Instant, standard GAAP financial statements" },
  ],
}

export const navbarContent = {
  tagline: "Accounting on Autopilot",
  links: [
    { label: "Interactive Demo", href: "#demo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Comparison", href: "#comparison" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  signIn: "Sign In",
  desktopAction: "Get Started",
  mobileAction: "Get Started Free",
  menuLabel: "Toggle navigation menu",
}

export const ctaContent = {
  eyebrow: "Never stress over bookkeeping again",
  title: "Stop doing accounting. Start running your business.",
  description:
    "All it takes is creating a new entry in your business dashboard. Ihsaab handles the double-entry ledger, tax segregation, and financial reporting automatically.",
  primaryAction: "Get Started Free",
  signInAction: "Sign In",
  assurances: ["No credit card required", "14-day full feature trial", "Cancel anytime with 1 click"],
}

export const footerContent = {
  description:
    "The modern accounting application for small business owners. Do accounting without doing accounting. Simply create an entry—Ihsaab handles the rest.",
  status: "All systems operational • 256-bit SSL secured",
  productHeading: "Product",
  productLinks: [
    { label: "Interactive Simulator", href: "#demo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features for SMBs", href: "#features" },
    { label: "Ihsaab vs QuickBooks", href: "#comparison" },
    { label: "Pricing ($100/mo or $1000/yr)", href: "#pricing" },
  ],
  startHeading: "Get Started",
  startLinks: [
    { label: "Create Free Account", href: "/auth/sign-up", internal: true },
    { label: "Sign In", href: "/auth/sign-in", internal: true },
    { label: "FAQ & Support", href: "#faq", internal: false },
  ],
  compliance: "GAAP & IFRS Compliant",
  copyright: "Ihsaab Inc. Built for small business owners worldwide.",
  legalLinks: ["Privacy Policy", "Terms of Service", "Security"],
}
