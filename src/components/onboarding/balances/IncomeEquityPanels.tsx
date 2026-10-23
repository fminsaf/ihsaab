import type { Dispatch, SetStateAction } from "react";
import type { BalanceTab, IncomeStatementItem, OwnerShare } from "../../../types/businessOnboarding";
import { IncomeStatementPanel } from "./IncomeStatementPanel";
import { EquityPanel } from "./EquityPanel";

interface IncomeEquityPanelsProps {
  activeTab: BalanceTab; currencySymbol: string;
  incomeItems: IncomeStatementItem[]; setIncomeItems: Dispatch<SetStateAction<IncomeStatementItem[]>>;
  totalYtdRevenue: number; totalYtdExpenses: number; netIncome: number;
  owners: OwnerShare[]; setOwners: Dispatch<SetStateAction<OwnerShare[]>>;
  totalShares: number; retainedEarnings: number; setRetainedEarnings: (value: number) => void;
}

export function IncomeEquityPanels(props: IncomeEquityPanelsProps) {
  return <>
    {props.activeTab === "income" && <IncomeStatementPanel currencySymbol={props.currencySymbol} incomeItems={props.incomeItems} setIncomeItems={props.setIncomeItems} totalYtdRevenue={props.totalYtdRevenue} totalYtdExpenses={props.totalYtdExpenses} netIncome={props.netIncome} />}
    {props.activeTab === "equity" && <EquityPanel currencySymbol={props.currencySymbol} owners={props.owners} setOwners={props.setOwners} totalShares={props.totalShares} netIncome={props.netIncome} retainedEarnings={props.retainedEarnings} setRetainedEarnings={props.setRetainedEarnings} />}
  </>;
}
