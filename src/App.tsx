import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Validation from "./pages/Validation";
import { AuthProvider } from "@/context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RegisterFacility from "./pages/RegisterFacility";
import Approvals from "./pages/Approvals";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProgramSettings from "./pages/ProgramSettings";
import Requests from "./pages/Requests";
import RequestWizard from "./pages/RequestWizard";
import RequestDetail from "./pages/RequestDetail";
import ForecastWorkbench from "./pages/ForecastWorkbench";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LayoutTopBar from "@/components/layout/LayoutTopBar";
const queryClient = new QueryClient();

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isAuth = pathname.startsWith("/auth");

  return (
    <SidebarProvider>
      {!isAuth && (
        <header className="h-12 flex items-center border-b bg-background">
          <div className="container">
            <SidebarTrigger />
          </div>
        </header>
      )}
      <div className="flex min-h-screen w-full">
        {!isAuth && <AppSidebar />}
        <main className="flex-1">
          {!isAuth && <SiteHeader />}
          <LayoutTopBar />
          <div className="container py-4 space-y-4">
            <Breadcrumbs />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forecast" element={<ForecastWorkbench />} />
              <Route path="/validation" element={<Validation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<RegisterFacility />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/admin" element={<SuperAdminDashboard />} />
              <Route path="/program-settings" element={<ProgramSettings />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/requests/new" element={<RequestWizard />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <SiteFooter />
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
