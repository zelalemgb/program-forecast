import { NavLink, useLocation, Link } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarRail,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Camera,
  Upload,
  Database,
  TrendingUp,
  FileText,
  Download,
  ShoppingCart,
  Banknote,
  BarChart3,
  Map,
  Target,
  MessageSquare,
  Settings,
  Users,
  BookOpen,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Item {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const dashboardItems: Item[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const dataCapture: Item[] = [
  { title: "Snap-to-Stock", url: "/snap-to-stock", icon: Camera },
  { title: "File Upload", url: "/file-upload", icon: Upload },
  { title: "API/Data Feeds", url: "/data-feeds", icon: Database },
];

const dagu: Item[] = [
  { title: "Dagu – Facility Supply", url: "/dagu", icon: Database },
  { title: "Supply Planning", url: "/dagu?tab=supply-planning", icon: FileText },
];

const forecasting: Item[] = [
  { title: "Run Forecast", url: "/forecast", icon: TrendingUp },
  { title: "View Assumptions", url: "/forecast/assumptions", icon: FileText },
  { title: "Download Reports", url: "/forecast/reports", icon: Download },
];

const supplyPlanning: Item[] = [
  { title: "Review Procurement Plan", url: "/procurement-plan", icon: ShoppingCart },
  { title: "Budget Alignment", url: "/budget-alignment", icon: Banknote },
];

const analytics: Item[] = [
  { title: "Facility Trends", url: "/analytics/facility", icon: BarChart3 },
  { title: "Regional/National Trends", url: "/analytics/regional", icon: Map },
  { title: "Forecast Accuracy", url: "/analytics/accuracy", icon: Target },
];

const aiAssistant: Item[] = [
  { title: "AI Assistant", url: "/ai-assistant", icon: MessageSquare },
];

const admin: Item[] = [
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/program-settings", icon: Settings },
];

const helpTraining: Item[] = [
  { title: "Guides", url: "/help/guides", icon: BookOpen },
  { title: "Micro-learning Videos", url: "/help/videos", icon: Play },
];

function Group({ label, items }: { label: string; items: Item[] }) {
  const location = useLocation();
  const { state } = useSidebar();
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className={getNavCls}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
  if (!user && pathname === "/") return null;
  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {state !== "collapsed" && (
            <div>
              <div className="text-sm font-semibold">Forlab+</div>
              <div className="text-xs text-muted-foreground">MoH Platform</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2 flex justify-end">
          <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={toggleSidebar}>
            <Collapser className="h-4 w-4" />
          </Button>
        </div>
        
        <Group label="" items={dashboardItems} />
        <Group label="Data Capture" items={dataCapture} />
        <Group label="Supply Operations" items={dagu} />
        <Group label="Forecasting" items={forecasting} />
        <Group label="Supply Planning" items={supplyPlanning} />
        <Group label="Analytics & Reports" items={analytics} />
        <Group label="" items={aiAssistant} />
        <Group label="Admin" items={admin} />
        <Group label="Help & Training" items={helpTraining} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;