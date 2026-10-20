import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import LandingPage from "./pages/landingPage";
import NotFoundPage from "./pages/404";
import SignUpPage from "./pages/signUp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={LandingPage} />
        <Route path="/auth/sign-up" Component={SignUpPage} />
        <Route path="*" Component={NotFoundPage} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
