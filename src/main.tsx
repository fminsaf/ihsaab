import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import LandingPage from "./pages/landingPage";
import NotFoundPage from "./pages/404";
import AuthLayout from "./pages/auth/layout";
import SignInPage from "./pages/auth/signIn";
import SignUpPage from "./pages/auth/signUp";
import ProtectedLayout from "./pages/protected/protectedLayout";
import { AuthProvider } from "./auth/authProvider";
import CreateBusinessPage from "./pages/protected/createBusiness";
import { Toaster } from "./components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="create-business" element={<CreateBusinessPage />} />
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
  </StrictMode>,
);
