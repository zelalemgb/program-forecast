import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  "": "Home",
  dashboard: "Dashboard",
  validation: "Validation",
  profile: "Profile",
  register: "Register Facility",
  approvals: "Approvals",
  admin: "Admin",
  "program-settings": "Program Settings",
  requests: "Requests",
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] === "auth") return null;
  const items = parts.map((seg, idx) => {
    const path = "/" + parts.slice(0, idx + 1).join("/");
    const isLast = idx === parts.length - 1;
    const label = labels[seg] ?? seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { path, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {parts.length === 0 ? (
            <BreadcrumbPage>Home</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <NavLink to="/">Home</NavLink>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {items.map((item) => (
          <React.Fragment key={item.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <NavLink to={item.path}>{item.label}</NavLink>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
