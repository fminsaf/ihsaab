import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "ar" | "en";

const messages = {
  en: {
    overview: "Overview",
    transactions: "Transactions",
    generalLedger: "General Ledger",
    accounts: "Accounts",
    financialStatements: "Financial Statements",
    contacts: "Contacts",
    inventory: "Inventory",
    businessSettings: "Business Settings",
    help: "Help & getting started",
    feedback: "Feedback",
    personalSettings: "Personal Account Settings",
    overviewDescription: "Summary of your cash balances, revenue, and expenses.",
    transactionsDescription: "View and filter all recorded business transactions.",
    contactsDescription: "Manage customers and vendors, and see their transactions.",
    ledgerDescription: "Every posted transaction and its debit and credit entries.",
    accountsDescription: "Review account balances and debit or credit activity by category.",
    inventoryDescription: "Manage products, stock, and item prices.",
    statementsDescription: "Profit & Loss, Balance Sheet, Cash Flow, and Trial Balance.",
    settingsDescription: "Configuration for your business.",
    helpDescription: "Learn how to record entries and review your business books.",
    feedbackDescription: "Share your experience and help improve Ihsaab.",
    personalDescription: "Manage your profile, email, and credentials.",
    dashboard: "Dashboard",
    newEntry: "New entry",
    appearance: "Appearance",
    switchBusiness: "Switch Business",
    createBusiness: "Create New Business",
    signOut: "Sign out",
    language: "Language",
    english: "English",
    arabic: "العربية",
    myBusiness: "My Business",
    currency: "Currency",
    sar: "Saudi Riyal (SAR)",
    localeNotice: "Language changes are saved on this device.",
    contactsTitle: "Your contacts",
    contactsSubtitle: "Keep customer and vendor details with their transaction history.",
    addContact: "Add contact",
    searchContacts: "Search contacts...",
    noContacts: "No contacts yet",
    save: "Save",
    cancel: "Cancel",
    customer: "Customer",
    supplier: "Supplier",
    contactName: "Contact name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    notes: "Notes",
    inventoryTitle: "Inventory",
    inventorySubtitle: "Track products, stock quantities, and prices.",
    addProduct: "Add product",
    productName: "Product name",
    sku: "SKU / item code",
    quantity: "Quantity",
    salePrice: "Sale price",
    purchaseCost: "Purchase cost",
    unit: "Unit",
    transactionsTitle: "Transactions",
    transactionsSubtitle: "Review income, expenses, and transfers.",
    invoice: "Invoice",
    invoiceNumber: "Invoice number",
    invoiceDate: "Invoice date",
    dueDate: "Due date",
    subtotal: "Subtotal",
    vat: "VAT",
    total: "Total",
    paid: "Paid",
    unpaid: "Unpaid",
    profit: "Profit",
    revenue: "Revenue",
    expenses: "Expenses",
    cash: "Cash",
    bank: "Bank",
    customerBalance: "Customer balance",
    supplierBalance: "Supplier balance",
  },
  ar: {
    overview: "نظرة عامة",
    transactions: "المعاملات",
    generalLedger: "دفتر الأستاذ العام",
    accounts: "الحسابات",
    financialStatements: "القوائم المالية",
    contacts: "جهات الاتصال",
    inventory: "المخزون",
    businessSettings: "إعدادات المنشأة",
    help: "المساعدة والبدء",
    feedback: "الملاحظات",
    personalSettings: "إعدادات الحساب الشخصي",
    overviewDescription: "ملخص الأرصدة النقدية والإيرادات والمصروفات.",
    transactionsDescription: "عرض معاملات المنشأة المسجلة وتصفيتها.",
    contactsDescription: "إدارة العملاء والموردين والاطلاع على معاملاتهم.",
    ledgerDescription: "المعاملات المرحلة وقيود المدين والدائن.",
    accountsDescription: "مراجعة أرصدة الحسابات وحركة المدين والدائن.",
    inventoryDescription: "إدارة المنتجات والمخزون وأسعار الأصناف.",
    statementsDescription: "قائمة الدخل والميزانية والتدفقات النقدية وميزان المراجعة.",
    settingsDescription: "إعدادات منشأتك.",
    helpDescription: "تعرف على تسجيل القيود ومراجعة حسابات المنشأة.",
    feedbackDescription: "شاركنا تجربتك وساعدنا في تحسين حساب.",
    personalDescription: "إدارة ملفك الشخصي وبريدك الإلكتروني وبيانات الدخول.",
    dashboard: "لوحة التحكم",
    newEntry: "قيد جديد",
    appearance: "المظهر",
    switchBusiness: "تبديل المنشأة",
    createBusiness: "إنشاء منشأة جديدة",
    signOut: "تسجيل الخروج",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    myBusiness: "منشأتي",
    currency: "العملة",
    sar: "الريال السعودي (SAR)",
    localeNotice: "يتم حفظ اللغة على هذا الجهاز.",
    contactsTitle: "جهات الاتصال",
    contactsSubtitle: "إدارة بيانات العملاء والموردين وسجل معاملاتهم.",
    addContact: "إضافة جهة اتصال",
    searchContacts: "البحث عن جهة اتصال...",
    noContacts: "لا توجد جهات اتصال بعد",
    save: "حفظ",
    cancel: "إلغاء",
    customer: "عميل",
    supplier: "مورد",
    contactName: "اسم جهة الاتصال",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    company: "الشركة",
    notes: "ملاحظات",
    inventoryTitle: "المخزون",
    inventorySubtitle: "متابعة المنتجات وكميات المخزون والأسعار.",
    addProduct: "إضافة منتج",
    productName: "اسم المنتج",
    sku: "رمز الصنف",
    quantity: "الكمية",
    salePrice: "سعر البيع",
    purchaseCost: "تكلفة الشراء",
    unit: "الوحدة",
    transactionsTitle: "المعاملات",
    transactionsSubtitle: "مراجعة الإيرادات والمصروفات والتحويلات.",
    invoice: "فاتورة",
    invoiceNumber: "رقم الفاتورة",
    invoiceDate: "تاريخ الفاتورة",
    dueDate: "تاريخ الاستحقاق",
    subtotal: "المجموع الفرعي",
    vat: "ضريبة القيمة المضافة",
    total: "الإجمالي",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    profit: "الربح",
    revenue: "الإيرادات",
    expenses: "المصروفات",
    cash: "نقدًا",
    bank: "البنك",
    customerBalance: "رصيد العميل",
    supplierBalance: "رصيد المورد",
  },
} as const;

export type MessageKey = keyof typeof messages.en;
type LocaleContextValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function initialLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  const queryLocale = new URLSearchParams(window.location.search).get("lang");
  if (queryLocale === "ar" || queryLocale === "en") return queryLocale;
  const saved = window.localStorage.getItem("ihsaab-locale");
  return saved === "ar" || saved === "en" ? saved : "ar";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("ihsaab-locale", next);
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    setLocale,
    t: (key) => messages[locale][key] ?? messages.en[key],
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
