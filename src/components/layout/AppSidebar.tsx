import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarRail,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Camera,
  Database,
  TrendingUp,
  ShoppingCart,
  Banknote,
  BarChart3,
  Map,
  Settings,
  Users,
  BookOpen,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { filterNavigationByRole, shouldShowInSidebar } from "@/utils/navigationUtils";
import { navigationPages } from "@/config/navigation";

interface Item {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: Item[];
}

const getDashboardItems = (permissions: ReturnType<typeof useRolePermissions>): Item[] => {
  const items: Item[] = [
    { title: "Home", url: "/", icon: LayoutDashboard },
  ];

  // Add role-specific dashboards
  if (permissions.canViewOwnFacility) {
    items.push({ title: "Facility Dashboard", url: "/facility-dashboard", icon: Building2 });
  }
  if (permissions.canViewWoredasFacilities) {
    items.push({ title: "Woreda Dashboard", url: "/woreda-dashboard", icon: Building2 });
  }
  if (permissions.canViewZoneFacilities) {
    items.push({ title: "Zone Dashboard", url: "/zone-dashboard", icon: Map });
  }
  if (permissions.canViewRegionalFacilities) {
    items.push({ title: "Regional Dashboard", url: "/regional-dashboard", icon: Map });
  }
  if (permissions.canViewNationalData) {
    items.push({ title: "National Dashboard", url: "/national-dashboard", icon: Map });
  }

  // Always show CDSS Dashboard
  items.push({ title: "CDSS Dashboard", url: "/cdss-dashboard", icon: Banknote });

  return items;
};

interface ItemWithComingSoon extends Item {
  comingSoon?: boolean;
}

const dataCapture: ItemWithComingSoon[] = [
  { title: "Inventory Management", url: "/dagu", icon: Database },
  { title: "Snap-to-Stock", url: "/snap-to-stock", icon: Camera, comingSoon: true },
];

const forecasting: Item[] = [
  { title: "Run Forecast", url: "/forecast", icon: TrendingUp },
  { title: "Validate Excel Forecast", url: "/dashboard", icon: BarChart3 },
];

const supplyPlanning: Item[] = [
  { title: "Supply Planning", url: "/supply-planning", icon: ShoppingCart },
  { title: "CDSS Budget Alignment", url: "/budget-alignment", icon: Banknote },
];

const settings: Item[] = [
  { title: "Metadata", url: "/settings/metadata", icon: Database },
];

const getAdminItems = (permissions: ReturnType<typeof useRolePermissions>): Item[] => {
  const items: Item[] = [];
  
  if (permissions.canManageUsers) {
    items.push({ title: "User Management", url: "/user-management", icon: Users });
  }
  
  return items;
};

const helpTraining: Item[] = [
  { title: "Guides", url: "/help/guides", icon: BookOpen },
  { title: "Micro-learning Videos", url: "/help/videos", icon: Play },
];

function Group({ label, items }: { label: string; items: (Item | ItemWithComingSoon)[] }) {
  const location = useLocation();
  const { state } = useSidebar();
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const itemWithComingSoon = item as ItemWithComingSoon;
            const isComingSoon = itemWithComingSoon.comingSoon;
            
            if (isComingSoon) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="opacity-50 cursor-not-allowed">
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && (
                      <span className="flex items-center justify-between w-full">
                        {item.title}
                        <span className="text-xs text-muted-foreground ml-2">Coming Soon</span>
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Handle items with subitems
            if (item.items && item.items.length > 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url || "#"} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && (
                        <span className="flex items-center justify-between w-full">
                          {item.title}
                          <ChevronDown className="h-3 w-3" />
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                  {state !== "collapsed" && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink to={subItem.url || "#"} className={getNavCls}>
                              <subItem.icon className="mr-2 h-3 w-3" />
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            }
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url || "#"} end className={getNavCls}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const AppSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const Collapser = state === "collapsed" ? ChevronRight : ChevronLeft;
  const location = useLocation();
  const { pathname } = location;
  const { user } = useAuth();
  const navigate = useNavigate();
  const permissions = useRolePermissions();
  const { userRole, adminLevel } = useCurrentUser();
  
  const handleLogoClick = () => {
    console.log("Logo clicked - navigating to /");
    navigate("/");
  };
  
  // Get role-specific menu items
  const dashboardItems = getDashboardItems(permissions);
  const adminItems = getAdminItems(permissions);

  if (!user && pathname === "/") return null;
  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="p-0">
        <div 
          className="flex items-center gap-2 px-2 py-1.5 mx-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer relative z-10"
          title="Go to Dashboard"
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {state !== "collapsed" && (
            <div>
              <div className="text-sm font-semibold">Forlab+</div>
              <div className="text-xs text-muted-foreground">MoH Platform</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2 flex justify-end">
          <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={toggleSidebar}>
            <Collapser className="h-4 w-4" />
          </Button>
        </div>
        
        <Group label="" items={dashboardItems} />
        {permissions.canViewOwnFacility && <Group label="Data Capture" items={dataCapture} />}
        {permissions.canGenerateForecast && <Group label="Forecasting" items={forecasting} />}
        {permissions.canViewAnalytics && <Group label="Supply Planning" items={supplyPlanning} />}
        {(permissions.canManageSystem || permissions.isFacilityLevel) && <Group label="Settings" items={settings} />}
        {adminItems.length > 0 && <Group label="Admin" items={adminItems} />}
        <Group label="Help & Training" items={helpTraining} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;