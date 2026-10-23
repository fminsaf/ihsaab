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
  audience: "Ihsaab public beta · Built for SMB owners",
  promise: "Zero debits or credits required",
  headline: "Do your accounting",
  headlineEmphasis: "without doing accounting.",
  description:
    "You started a business to build something great—not to babysit spreadsheets, reconcile bank lines, or decipher double-entry codes. Just create a new entry in Ihsaab, and our automated engine handles the rest.",
  primaryAction: "Try the Beta",
  signInAction: "Sign In",
  assurances: ["Public beta", "Core bookkeeping flows ready", "Your feedback shapes what’s next"],
  demoLabel: "Sample Ihsaab dashboard",
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
        "Choose what happened, enter the amount, and add a plain-language note. Ihsaab handles the matching ledger entries behind the scenes.",
    },
    {
      icon: PiggyBank,
      title: "Tax amounts kept visible",
      description:
        "Add the tax amount you collected or paid when you record an entry. Ihsaab posts it separately so you can see the amount alongside your books.",
    },
    {
      icon: TrendingUp,
      title: "A clear financial overview",
      description:
        "See recorded income, expenses, assets, liabilities, and equity together on your business dashboard.",
    },
    {
      icon: Receipt,
      title: "Sales and customer payments",
      description:
        "Record product sales, service income, and customer payments. Keep an invoice number or note with the entry for easier follow-up.",
    },
    {
      icon: FileSpreadsheet,
      title: "1-Click CPA Export",
      description:
        "Review and print the profit and loss, balance sheet, cash flow, trial balance, and ledger activity for your accountant.",
    },
    {
      icon: Smartphone,
      title: "Responsive On-The-Go Access",
      description:
        "Log a coffee shop sale, retail transaction, or vendor payment right from your phone behind the counter or while on a client site.",
    },
  ],
  securityTitle: "Private business records",
  securityDescription:
    "Business records are protected by sign-in and database access rules.",
  uptime: "Account-controlled access",
}

export const howItWorksContent = {
  eyebrow: "How It Works",
  title: "Accounting without the headache.",
  description: "Traditional software forces you to learn accounting. Ihsaab is designed so you never have to.",
  steps: [
    {
      number: "01",
      title: "Record What Happened",
      subtitle: "Choose the entry type, then add a plain-language note",
      description:
        "Forget chart of accounts, debit/credit rules, or ledger codes. Choose a sale, purchase, expense, or transfer, then record the amount and what it was for.",
      icon: PlusCircle,
      badge: "No accounting jargon",
      visualText: "Paid rent $1,200 from the bank",
    },
    {
      number: "02",
      title: "Ihsaab Autopilots the Books",
      subtitle: "The engine runs double-entry accounting in the background",
      description:
        "Ihsaab creates the matching ledger entries and updates your reports behind the scenes. Add any tax amount you already know when recording the entry.",
      icon: Cpu,
      badge: "Postings created automatically",
      visualText: "Dr. Rent Expense $1,200 · Cr. Bank $1,200",
    },
    {
      number: "03",
      title: "Financial reports on demand",
      subtitle: "Clear reports whenever you need them",
      description:
        "Review current totals and print financial statements or ledger activity to share with your accountant.",
      icon: FileCheck,
      badge: "Reports on demand",
      visualText: "Profit & loss · Balance sheet · Cash flow",
    },
  ],
  whatHappens: "What happens:",
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
        "Ihsaab provides ledger activity and printable profit and loss, balance sheet, cash flow, and trial balance reports. You can review and share these records with your accountant.",
    },
    {
      question: "How are tax amounts recorded?",
      answer:
        "You enter the tax amount when recording an entry. Ihsaab posts it to a separate ledger account so it appears in your financial records.",
    },
    {
      question: "What if I make a mistake or need to adjust an entry?",
      answer:
        "You can correct posted transactions. Ihsaab records a reversal and replacement so the transaction history remains visible. Opening balances are locked after setup.",
    },
    {
      question: "Is my business data secure and private?",
      answer:
        "Business records are protected by sign-in and database access rules. Each owner can access only the business records allowed for their account.",
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
    { feature: "Double-Entry Book Balancing", traditional: "Manual reconciliation; easy to be out of balance", spreadsheets: "No automatic balancing mechanism", ihsaab: "Matching ledger lines created from each entry" },
    { feature: "Tax Preparation & Reserves", traditional: "Chaotic calculation at year-end", spreadsheets: "Manual guessing and formula errors", ihsaab: "Tax amounts recorded with each entry" },
    { feature: "Time Spent per Week", traditional: "Time needed for reconciliations", spreadsheets: "Time needed to maintain formulas", ihsaab: "Designed to reduce manual bookkeeping work" },
    { feature: "CPA / Accountant Export", traditional: "Messy adjustments needed", spreadsheets: "Accountants charge extra to clean up", ihsaab: "Printable financial reports and ledger activity" },
  ],
}

export const navbarContent = {
  tagline: "Ihsaab public beta",
  links: [
    { label: "Interactive Demo", href: "#demo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Comparison", href: "#comparison" },
    { label: "FAQ", href: "#faq" },
  ],
  signIn: "Sign In",
  desktopAction: "Try the Beta",
  mobileAction: "Try the Beta",
  menuLabel: "Toggle navigation menu",
}

export const ctaContent = {
  eyebrow: "Ihsaab public beta",
  title: "Stop doing accounting. Start running your business.",
  description:
    "Create an entry in your business dashboard. Ihsaab creates the matching ledger postings and updates your financial reports automatically.",
  primaryAction: "Try the Beta",
  signInAction: "Sign In",
  assurances: ["Features are still evolving", "Core bookkeeping flows are ready", "Your feedback shapes what’s next"],
}

export const footerContent = {
  description:
    "The modern accounting application for small business owners. Do accounting without doing accounting. Simply create an entry—Ihsaab handles the rest.",
  status: "Business records protected by account access controls",
  productHeading: "Product",
  productLinks: [
    { label: "Sample Dashboard", href: "#demo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features for SMBs", href: "#features" },
    { label: "Ihsaab vs QuickBooks", href: "#comparison" },
  ],
  startHeading: "Get Started",
  startLinks: [
    { label: "Create Beta Account", href: "/auth/sign-up", internal: true },
    { label: "Sign In", href: "/auth/sign-in", internal: true },
    { label: "FAQ & Support", href: "#faq", internal: false },
  ],
  compliance: "Financial reports built from your recorded entries",
  copyright: "Ihsaab Inc. Built for small business owners worldwide.",
  legalLinks: ["Privacy Policy", "Terms of Service", "Security"],
}
