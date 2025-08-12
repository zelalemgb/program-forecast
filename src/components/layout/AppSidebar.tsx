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
  Home,
  PencilRuler,
  ShieldAlert,
  LineChart,
  ShoppingCart,
  Settings,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Item {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const dataCollection: Item[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Requests", url: "/requests", icon: FolderKanban },
  { title: "New Request", url: "/requests/new", icon: PencilRuler },
  { title: "Register Facility", url: "/register", icon: Settings },
];

const guardrails: Item[] = [
  { title: "Validation", url: "/validation", icon: ShieldAlert },
];

const forecasting: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: LineChart },
  { title: "Program Settings", url: "/program-settings", icon: Settings },
  { title: "Approvals", url: "/approvals", icon: ShoppingCart },
];

const analytics: Item[] = [
  { title: "Analytics", url: "/dashboard", icon: LineChart },
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
  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <LineChart className="h-5 w-5" />
          {state !== "collapsed" && (
            <span className="text-base font-semibold tracking-tight">Forlab+</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2 flex justify-end">
          <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={toggleSidebar}>
            <Collapser className="h-4 w-4" />
          </Button>
        </div>
        <Group label="Data Collection" items={dataCollection} />
        <Group label="Guardrails" items={guardrails} />
        <Group label="Forecasting & Procurement" items={forecasting} />
        <Group label="Analytics" items={analytics} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
