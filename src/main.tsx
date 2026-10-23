import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LandingPage from "./pages/landingPage";
import NotFoundPage from "./pages/404";
import AuthLayout from "./pages/auth/layout";
import SignInPage from "./pages/auth/signIn";
import SignUpPage from "./pages/auth/signUp";
import ProtectedLayout from "./pages/protected/protectedLayout";
import { AuthProvider } from "./auth/authProvider";
import CreateBusinessPage from "./pages/protected/createBusiness";
import BusinessDashboardLayout from "./pages/protected/dashboard/layout";
import OverviewPage from "./pages/protected/dashboard/overview";
import ChartsPage from "./pages/protected/dashboard/charts";
import TransactionsPage from "./pages/protected/dashboard/transactions";
import ContactsPage from "./pages/protected/dashboard/contacts";
import LedgersPage from "./pages/protected/dashboard/ledgers";
import StatementsPage from "./pages/protected/dashboard/statements";
import BusinessSettingsPage from "./pages/protected/dashboard/businessSettings";
import AccountSettingsPage from "./pages/protected/dashboard/accountSettings";
import InventoryPage from "./pages/protected/dashboard/inventory";
import { Toaster } from "./components/ui/toast";
import { ThemeProvider } from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="create-business" element={<CreateBusinessPage />} />
            <Route path="b/:bid" element={<BusinessDashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="ledgers" element={<LedgersPage />} />
              <Route path="books" element={<Navigate to="../ledgers" replace />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="statements" element={<StatementsPage />} />
              <Route path="settings" element={<BusinessSettingsPage />} />
              <Route path="account" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          <Route path="auth" element={<AuthLayout />}>
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

    <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
