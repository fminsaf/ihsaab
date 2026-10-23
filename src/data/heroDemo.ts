import { Coffee, Laptop, ShoppingBag } from "lucide-react"

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  timestamp: string;
  journal: {
    debitAccount: string;
    creditAccount: string;
    taxSegregated: number;
  };
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  icon: typeof Coffee;
  startingTransactions: Transaction[];
}

export const BUSINESS_PROFILES: BusinessProfile[] = [
  {
    id: "cafe",
    name: "Bloom & Roast Cafe",
    type: "Food & Beverage",
    icon: Coffee,
    startingTransactions: [
      {
        id: "tx-1",
        description: "Saturday Morning Walk-in Rush",
        amount: 840,
        type: "income",
        category: "Food & Beverage Sales",
        timestamp: "Today, 11:30 AM",
        journal: {
          debitAccount: "Operating Cash Account",
          creditAccount: "F&B Revenue",
          taxSegregated: 84,
        },
      },
      {
        id: "tx-2",
        description: "Specialty Oat Milk & Beans Delivery",
        amount: 320,
        type: "expense",
        category: "Cost of Goods Sold",
        timestamp: "Today, 09:15 AM",
        journal: {
          debitAccount: "Inventory / Raw Materials",
          creditAccount: "Operating Cash Account",
          taxSegregated: 32,
        },
      },
      {
        id: "tx-3",
        description: "Commercial Espresso Grinder Maintenance",
        amount: 140,
        type: "expense",
        category: "Repairs & Equipment",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Equipment Maintenance",
          creditAccount: "Operating Cash Account",
          taxSegregated: 14,
        },
      },
      {
        id: "tx-4",
        description: "Local Office Weekly Coffee Catering",
        amount: 620,
        type: "income",
        category: "Catering Contracts",
        timestamp: "2 days ago",
        journal: {
          debitAccount: "Accounts Receivable / Cash",
          creditAccount: "Catering Income",
          taxSegregated: 62,
        },
      },
    ],
  },
  {
    id: "agency",
    name: "Apex Studio & Design",
    type: "Digital Agency",
    icon: Laptop,
    startingTransactions: [
      {
        id: "tx-a1",
        description: "Brand Identity Project Milestone 2",
        amount: 2800,
        type: "income",
        category: "Design Services",
        timestamp: "Today, 10:00 AM",
        journal: {
          debitAccount: "Operating Bank",
          creditAccount: "Professional Services Revenue",
          taxSegregated: 280,
        },
      },
      {
        id: "tx-a2",
        description: "Figma & Adobe Cloud Subscriptions",
        amount: 195,
        type: "expense",
        category: "Software Subscriptions",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Software & SaaS Expense",
          creditAccount: "Business Credit Card",
          taxSegregated: 19.5,
        },
      },
      {
        id: "tx-a3",
        description: "SEO Retainer - Tech Startup Client",
        amount: 1500,
        type: "income",
        category: "Retainers",
        timestamp: "3 days ago",
        journal: {
          debitAccount: "Operating Bank",
          creditAccount: "Retainer Revenue",
          taxSegregated: 150,
        },
      },
    ],
  },
  {
    id: "retail",
    name: "Haven Living Boutique",
    type: "Retail Store",
    icon: ShoppingBag,
    startingTransactions: [
      {
        id: "tx-r1",
        description: "Weekend In-Store Footwear & Decor Sales",
        amount: 1650,
        type: "income",
        category: "Store Merchandise",
        timestamp: "Today, 04:30 PM",
        journal: {
          debitAccount: "Merchant Bank Deposit",
          creditAccount: "Retail Sales",
          taxSegregated: 165,
        },
      },
      {
        id: "tx-r2",
        description: "Wholesale Ceramic Home Ware Shipment",
        amount: 580,
        type: "expense",
        category: "Inventory Purchases",
        timestamp: "Yesterday",
        journal: {
          debitAccount: "Store Inventory Asset",
          creditAccount: "Accounts Payable / Bank",
          taxSegregated: 58,
        },
      },
    ],
  },
];

export const PRESETS = [
  { label: "+ $450 Wholesale Pastry Sale", amount: 450, type: "income" as const, category: "Bakery Sales" },
  { label: "- $120 Store Fiber Internet", amount: 120, type: "expense" as const, category: "Utilities" },
  { label: "+ $1,250 Corporate Event Retainer", amount: 1250, type: "income" as const, category: "Event Catering" },
  { label: "- $290 POS Terminal & Packaging Supplies", amount: 290, type: "expense" as const, category: "Store Supplies" },
];

