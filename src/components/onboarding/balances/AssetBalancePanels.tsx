import type { Dispatch, SetStateAction } from "react";
import type { BalanceTab, BankAccount, DueContact, FixedAsset, LoanItem } from "../../../types/businessOnboarding";
import { CashBankPanel } from "./CashBankPanel";
import { ContactDuesPanel } from "./ContactDuesPanel";
import { FixedAssetsPanel } from "./FixedAssetsPanel";
import { LoansPanel } from "./LoansPanel";

interface AssetBalancePanelsProps {
  activeTab: BalanceTab; currencySymbol: string; cashOnHand: number; setCashOnHand: (value: number) => void;
  bankAccounts: BankAccount[]; setBankAccounts: Dispatch<SetStateAction<BankAccount[]>>;
  customerDues: DueContact[]; setCustomerDues: Dispatch<SetStateAction<DueContact[]>>;
  fixedAssets: FixedAsset[]; setFixedAssets: Dispatch<SetStateAction<FixedAsset[]>>;
  supplierDues: DueContact[]; setSupplierDues: Dispatch<SetStateAction<DueContact[]>>;
  loans: LoanItem[]; setLoans: Dispatch<SetStateAction<LoanItem[]>>;
}

export function AssetBalancePanels(props: AssetBalancePanelsProps) {
  const { activeTab, currencySymbol } = props;
  return <>
    {activeTab === "cash" && <CashBankPanel currencySymbol={currencySymbol} cashOnHand={props.cashOnHand} setCashOnHand={props.setCashOnHand} bankAccounts={props.bankAccounts} setBankAccounts={props.setBankAccounts} />}
    {activeTab === "receivables" && <ContactDuesPanel rows={props.customerDues} setRows={props.setCustomerDues} currencySymbol={currencySymbol} idPrefix="c" title="Unpaid Customer Invoices (Contacts)" description="Add the contact name of customers who currently owe your business money." addLabel="Add Customer Due" emptyMessage="No customer dues entered. (If no one owes you money, leave this empty)." namePlaceholder="Customer / Client Name" amountPlaceholder="Amount Due" />}
    {activeTab === "assets" && <FixedAssetsPanel currencySymbol={currencySymbol} fixedAssets={props.fixedAssets} setFixedAssets={props.setFixedAssets} />}
    {activeTab === "payables" && <ContactDuesPanel rows={props.supplierDues} setRows={props.setSupplierDues} currencySymbol={currencySymbol} idPrefix="sup" title="Supplier Invoices & Unpaid Bills" description="Add contact name for vendors, suppliers, or small dues like electricity and rent." addLabel="Add Due" emptyMessage="No supplier debts or unpaid bills entered." namePlaceholder="Vendor / Contact (e.g. Bean Wholesaler, Electricity Co)" amountPlaceholder="Amount" />}
    {activeTab === "loans" && <LoansPanel currencySymbol={currencySymbol} loans={props.loans} setLoans={props.setLoans} />}
  </>;
}
