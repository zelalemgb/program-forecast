import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, HelpCircle, Menu, Wifi, WifiOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  currentLocation?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  currentLocation = "National Overview" 
}) => {
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [isOnline] = React.useState(true); // Would be connected to actual online status

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 gap-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="hidden sm:block">
          <h1 className="font-medium text-foreground">{currentLocation}</h1>
          <p className="text-xs text-muted-foreground">Role-Based View</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Sync status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-green-600" />
              <span>Synced 2 min ago</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-600" />
              <span>Offline mode</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2 border-b">
              <h4 className="font-medium">Notifications</h4>
            </div>
            <DropdownMenuItem className="p-3">
              <div>
                <p className="text-sm font-medium">Stock Alert</p>
                <p className="text-xs text-muted-foreground">Amoxicillin running low at 3 facilities</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3">
              <div>
                <p className="text-sm font-medium">Data Submission</p>
                <p className="text-xs text-muted-foreground">RRF due in 2 days for 5 facilities</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notifications" className="text-center text-sm text-blue-600">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/help">
            <HelpCircle className="h-4 w-4" />
          </Link>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.email || ""} />
                <AvatarFallback className="text-xs">
                  {user?.email?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Facility Administrator</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/program-settings">Program Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;