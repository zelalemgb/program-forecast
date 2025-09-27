import React from "react";
import { User, Settings, LogOut, MapPin, Building, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useUserFacility } from "@/hooks/useUserFacility";
import { useNavigate } from "react-router-dom";

export const UserProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const { facilityName, facilityType, role, locationDisplay } = useUserFacility();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'analyst':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="User Profile"
        >
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-background border shadow-lg" 
        align="end"
        sideOffset={5}
      >
        {/* User Header */}
        <DropdownMenuLabel className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(getUserDisplayName())}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role and Facility Info */}
        <div className="px-4 py-3 space-y-3">
          {role && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Role</span>
              <Badge className={getRoleBadgeColor(role)}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            </div>
          )}

          {facilityName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Building className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Facility</span>
              </div>
              <p className="text-sm font-medium truncate">{facilityName}</p>
              {facilityType && (
                <p className="text-xs text-muted-foreground">{facilityType}</p>
              )}
            </div>
          )}

          {locationDisplay && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Location</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{locationDisplay}</p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <div className="p-1">
          <DropdownMenuItem 
            className="cursor-pointer flex items-center justify-between"
            onClick={() => navigate("/profile")}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>More Details</span>
            </div>
            <ChevronRight className="h-3 w-3" />
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;