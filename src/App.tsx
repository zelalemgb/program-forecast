import { Suspense, lazy } from "react";
import type { ComponentProps, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NavigationProvider } from "@/context/NavigationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import UnifiedTopBar from "@/components/layout/UnifiedTopBar";

const Auth = lazy(() => import("./pages/Auth"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Validation = lazy(() => import("./pages/Validation"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CDSSDashboard = lazy(() => import("./pages/CDSSDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const RegisterFacility = lazy(() => import("./pages/RegisterFacility"));
const Approvals = lazy(() => import("./pages/Approvals"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const MetadataOrganization = lazy(
  () => import("./pages/settings/MetadataOrganization"),
);
const FacilitiesManagement = lazy(
  () => import("./pages/settings/FacilitiesManagement"),
);
const ProductsManagement = lazy(
  () => import("./pages/settings/ProductsManagement"),
);
const BulkImport = lazy(() => import("./pages/settings/BulkImport"));
const RegionalHubsManagement = lazy(
  () => import("./pages/settings/RegionalHubsManagement"),
);
const AccountTypesManagement = lazy(
  () => import("./pages/settings/AccountTypesManagement"),
);
const AreasManagement = lazy(() => import("./pages/settings/AreasManagement"));
const Requests = lazy(() => import("./pages/Requests"));
const RequestWizard = lazy(() => import("./pages/RequestWizard"));
const RequestDetail = lazy(() => import("./pages/RequestDetail"));
const ForecastWorkbench = lazy(() => import("./pages/ForecastWorkbench"));
const RunForecast = lazy(() => import("./pages/RunForecast"));
const Dagu = lazy(() => import("./pages/Dagu"));
const SupplyPlanning = lazy(() => import("./pages/SupplyPlanning"));
const BudgetAlignment = lazy(() => import("./pages/BudgetAlignment"));
const Guides = lazy(() => import("./pages/Guides"));
const Videos = lazy(() => import("./pages/Videos"));
const ForecastAnalysis = lazy(() => import("./pages/ForecastAnalysis"));
const ForecastHome = lazy(() => import("./pages/ForecastHome"));
const SavedForecasts = lazy(() => import("./pages/SavedForecasts"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const WoredasDashboard = lazy(() => import("./pages/WoredasDashboard"));
const ZoneDashboard = lazy(() => import("./pages/ZoneDashboard"));
const RegionalDashboard = lazy(() => import("./pages/RegionalDashboard"));
const NationalDashboard = lazy(() => import("./pages/NationalDashboard"));
const ReceiveStock = lazy(() => import("./pages/ReceiveStock"));
const IssueStock = lazy(() => import("./pages/IssueStock"));
const RoleBasedRegistration = lazy(
  () => import("./pages/RoleBasedRegistration"),
);
const FacilityDashboard = lazy(() => import("./pages/FacilityDashboard"));

type RouteConfig = {
  path: string;
  Component: ComponentType;
  isProtected?: boolean;
  protectedRouteProps?: Partial<ComponentProps<typeof ProtectedRoute>>;
};

const routeConfig: RouteConfig[] = [
  { path: "/", Component: Index },
  { path: "/auth", Component: Auth },
  {
    path: "/role-registration",
    Component: RoleBasedRegistration,
    isProtected: true,
    protectedRouteProps: { requireAuth: false },
  },
  { path: "/facility-dashboard", Component: FacilityDashboard, isProtected: true },
  { path: "/woreda-dashboard", Component: WoredasDashboard, isProtected: true },
  { path: "/zone-dashboard", Component: ZoneDashboard, isProtected: true },
  { path: "/regional-dashboard", Component: RegionalDashboard, isProtected: true },
  { path: "/national-dashboard", Component: NationalDashboard, isProtected: true },
  { path: "/dashboard", Component: Dashboard, isProtected: true },
  { path: "/cdss-dashboard", Component: CDSSDashboard, isProtected: true },
  { path: "/forecast", Component: ForecastHome, isProtected: true },
  { path: "/forecast-home", Component: ForecastHome, isProtected: true },
  { path: "/forecast-analysis", Component: ForecastAnalysis, isProtected: true },
  { path: "/saved-forecasts", Component: SavedForecasts, isProtected: true },
  { path: "/forecast-workbench", Component: ForecastWorkbench, isProtected: true },
  { path: "/dagu", Component: Dagu, isProtected: true },
  { path: "/supply-planning", Component: SupplyPlanning, isProtected: true },
  { path: "/budget-alignment", Component: BudgetAlignment, isProtected: true },
  { path: "/receive-stock", Component: ReceiveStock, isProtected: true },
  { path: "/issue-stock", Component: IssueStock, isProtected: true },
  { path: "/validation", Component: Validation, isProtected: true },
  { path: "/profile", Component: Profile, isProtected: true },
  { path: "/register", Component: RegisterFacility, isProtected: true },
  { path: "/approvals", Component: Approvals, isProtected: true },
  { path: "/admin", Component: SuperAdminDashboard, isProtected: true },
  { path: "/user-management", Component: UserManagement, isProtected: true },
  { path: "/settings/metadata", Component: MetadataOrganization, isProtected: true },
  {
    path: "/settings/metadata/facilities",
    Component: FacilitiesManagement,
    isProtected: true,
  },
  {
    path: "/settings/metadata/products",
    Component: ProductsManagement,
    isProtected: true,
  },
  {
    path: "/settings/metadata/account-types",
    Component: AccountTypesManagement,
    isProtected: true,
  },
  {
    path: "/settings/metadata/regional-hubs",
    Component: RegionalHubsManagement,
    isProtected: true,
  },
  {
    path: "/settings/metadata/areas",
    Component: AreasManagement,
    isProtected: true,
  },
  {
    path: "/settings/metadata/bulk-import",
    Component: BulkImport,
    isProtected: true,
  },
  { path: "/requests", Component: Requests, isProtected: true },
  { path: "/requests/new", Component: RequestWizard, isProtected: true },
  { path: "/requests/:id", Component: RequestDetail, isProtected: true },
  { path: "/help/guides", Component: Guides, isProtected: true },
  { path: "/help/videos", Component: Videos, isProtected: true },
  { path: "*", Component: NotFound },
];

const queryClient = new QueryClient();

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAuth = pathname === "/auth";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {user && !isAuth && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          {user && !isAuth && <UnifiedTopBar />}
          
          <main className="flex-1 overflow-x-auto">
            <Suspense
              fallback={
                <div className="flex w-full justify-center py-10 text-sm text-muted-foreground">
                  Loading...
                </div>
              }
            >
              <Routes>
                {routeConfig.map(
                  ({ path, Component, isProtected, protectedRouteProps }) => {
                    const element = isProtected ? (
                      <ProtectedRoute {...protectedRouteProps}>
                        <Component />
                      </ProtectedRoute>
                    ) : (
                      <Component />
                    );

                    return <Route key={path} path={path} element={element} />;
                  },
                )}
              </Routes>
            </Suspense>
          </main>

          {user && !isAuth && (
            <footer className="border-t bg-background mt-auto flex-shrink-0">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-medium">v2.1.4</span>
                  <span>Last sync: 2 min ago</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <a href="#" className="hover:text-foreground transition-colors">Help Desk</a>
                  <select className="bg-transparent text-xs sm:text-sm border-0 focus:outline-none">
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
            <NavigationProvider>
              <AppShell />
            </NavigationProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;