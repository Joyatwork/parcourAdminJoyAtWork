import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PractitionersDashboardFixed from "./pages/PractitionersDashboardFixed";
import Companies from "./pages/Companies";
import ContractsDashboard from "./pages/ContractsDashboard";
import ChallengesDashboardNew from "./pages/ChallengesDashboardNew";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import SanteDiagnosticDashboard from "./pages/SanteDiagnosticDashboard";
import TestNavigation from "./pages/TestNavigation";
import BillingDashboard from "./pages/BillingDashboard";
import BillingWalletPage from "./pages/BillingWalletPage";
import BillingOrdersPage from "./pages/BillingOrdersPage";
import BillingCreditsPage from "./pages/BillingCreditsPage";
import BillingUsagesPage from "./pages/BillingUsagesPage";
import BillingPayoutsPage from "./pages/BillingPayoutsPage";
import Login from "./pages/Login";
import UsersPage from "./pages/UsersPage";
import { QVCTOverview } from "./components/Dashboard/QVCTOverview";
import { PredictiveAnalytics } from "./components/Dashboard/PredictiveAnalytics";
import AdminRGPD from "./pages/AdminRGPD";

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Dashboards */}
              <Route path="/dashboard" element={<Index />} />
              <Route path="/practitioners" element={<PractitionersDashboardFixed />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/contracts" element={<ContractsDashboard />} />
              <Route path="/challenges" element={<ChallengesDashboardNew />} />
              <Route path="/contents" element={<ContentLibraryPage />} />
              <Route path="/sante-diagnostic" element={<SanteDiagnosticDashboard />} />
              <Route path="/qvct" element={<QVCTOverview />} />
              <Route path="/analytics" element={<PredictiveAnalytics />} />
              <Route path="/users" element={<UsersPage />} />

              {/* RGPD */}
              <Route path="/admin/rgpd" element={<AdminRGPD />} />

              {/* Billing */}
              <Route path="/billing" element={<BillingDashboard />} />
              <Route path="/billing/wallet" element={<BillingWalletPage />} />
              <Route path="/billing/orders" element={<BillingOrdersPage />} />
              <Route path="/billing/credits" element={<BillingCreditsPage />} />
              <Route path="/billing/usages" element={<BillingUsagesPage />} />
              <Route path="/billing/payouts" element={<BillingPayoutsPage />} />

              {/* Churn */}
              <Route path="/churn" element={<Navigate to="/analytics" replace />} />

              {/* Test */}
              <Route path="/test" element={<TestNavigation />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;