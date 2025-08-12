import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm transition-colors ${
    isActive ? "bg-accent text-foreground" : "hover:bg-accent/60"
  }`;

export const SiteHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isPower, setIsPower] = React.useState(false); // admin or analyst
  React.useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsPower(false);
      return;
    }
    supabase.rpc('get_current_user_role').then(({ data, error }) => {
      if (error) {
        console.error('role check failed', error);
        setIsAdmin(false);
        setIsPower(false);
        return;
      }
      setIsAdmin(data === 'admin');
      setIsPower(data === 'admin' || data === 'analyst');
    });
  }, [user?.id]);

  const initials = user?.email?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed out" });
      navigate("/");
    }
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold tracking-tight">
            Health Forecasts
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkCls}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkCls}>
              Dashboard
            </NavLink>
            <NavLink to="/validation" className={navLinkCls}>
              Validation
            </NavLink>
            <NavLink to="/register" className={navLinkCls}>
              Register
            </NavLink>
            <NavLink to="/approvals" className={navLinkCls}>
              Approvals
            </NavLink>
            <NavLink to="/requests" className={navLinkCls}>
              Requests
            </NavLink>
            {isPower && (
              <NavLink to="/program-settings" className={navLinkCls}>
                Program Settings
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkCls}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user.email}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/validation">Validation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register">Register Facility</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/approvals">Approvals</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
