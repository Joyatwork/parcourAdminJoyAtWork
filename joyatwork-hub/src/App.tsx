import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PractitionersDashboardFixed from "./pages/PractitionersDashboardFixed";
import Companies from "./pages/Companies";
import ContractsDashboard from "./pages/ContractsDashboard";
import ChallengesDashboard from "./pages/ChallengesDashboard";
import SanteDiagnosticDashboard from "./pages/SanteDiagnosticDashboard";
import RendezVousDashboard from "./pages/RendezVousDashboard";
import TestNavigation from "./pages/TestNavigation";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/" element={<Index />} />
            <Route
              path="/practitioners"
              element={<PractitionersDashboardFixed />}
            />
            <Route path="/companies" element={<Companies />} />
            <Route path="/contracts" element={<ContractsDashboard />} />
            <Route path="/challenges" element={<ChallengesDashboard />} />
            <Route
              path="/sante-diagnostic"
              element={<SanteDiagnosticDashboard />}
            />
            <Route path="/rendez-vous" element={<RendezVousDashboard />} />
            <Route path="/test" element={<TestNavigation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
