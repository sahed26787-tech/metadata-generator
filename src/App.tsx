import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import AutomationScripts from "./pages/AutomationScripts";
import Documents from "./pages/Documents";
import Resources from "./pages/Resources";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import NoticePopup from "./components/NoticePopup";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <NoticePopup />
              <Routes>
                <Route path="/" element={<Navigate to="/metadata" replace />} />
                <Route path="/metadata" element={<Index />} />
                <Route path="/bg-remover" element={<Index />} />
                <Route path="/image-to-prompt" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/Services" element={<AutomationScripts />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/background-removal" element={<Navigate to="/bg-remover" replace />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                {/* Direct HTML paths also routed to React pages for SPA navigation */}
                <Route path="/terms-of-service.html" element={<TermsOfService />} />
                <Route path="/privacy-policy.html" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
