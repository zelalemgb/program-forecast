import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Validation from "./pages/Validation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CDSSDashboard from "./pages/CDSSDashboard";
import Profile from "./pages/Profile";
import RegisterFacility from "./pages/RegisterFacility";
import Approvals from "./pages/Approvals";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProgramSettings from "./pages/ProgramSettings";
import Requests from "./pages/Requests";
import RequestWizard from "./pages/RequestWizard";
import RequestDetail from "./pages/RequestDetail";
import ForecastWorkbench from "./pages/ForecastWorkbench";
import RunForecast from "./pages/RunForecast";
import Dagu from "./pages/Dagu";
import SupplyPlanning from "./pages/SupplyPlanning";
import BudgetAlignment from "./pages/BudgetAlignment";
import Guides from "./pages/Guides";
import Videos from "./pages/Videos";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

const queryClient = new QueryClient();

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAuth = pathname === "/auth";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {user && !isAuth && <AppSidebar />}
        <div className="flex-1 flex flex-col">
          {user && !isAuth && <DashboardHeader currentLocation="Boru Meda Hospital – Facility View" />}
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cdss-dashboard" element={<CDSSDashboard />} />
              <Route path="/forecast" element={<RunForecast />} />
              <Route path="/forecast-workbench" element={<ForecastWorkbench />} />
              <Route path="/dagu" element={<Dagu />} />
              <Route path="/supply-planning" element={<SupplyPlanning />} />
              <Route path="/budget-alignment" element={<BudgetAlignment />} />
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
              <Route path="/help/guides" element={<Guides />} />
              <Route path="/help/videos" element={<Videos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {user && !isAuth && (
            <footer className="border-t bg-background mt-auto">
              <div className="container py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>v2.1.4</span>
                  <span>Last sync: 2 min ago</span>
                </div>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-foreground">Help Desk</a>
                  <select className="bg-transparent">
                    <option>English</option>
                    <option>አማርኛ</option>
                  </select>
                </div>
              </div>
            </footer>
          )}
        </div>
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