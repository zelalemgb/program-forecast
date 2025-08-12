import { NavLink, useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { 
  Home,
  PencilRuler,
  ShieldAlert,
  LineChart,
  ShoppingCart,
  Settings,
  FolderKanban,
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
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <Group label="Data Collection" items={dataCollection} />
        <Group label="Guardrails" items={guardrails} />
        <Group label="Forecasting & Procurement" items={forecasting} />
        <Group label="Analytics" items={analytics} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
