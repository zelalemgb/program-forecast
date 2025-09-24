import React from "react";
import { NavLink } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useNavigation } from "@/context/NavigationContext";

const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useNavigation();
  
  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always show Home as first item if not on home page */}
        {breadcrumbs[0]?.path !== '/' && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavLink to="/">Home</NavLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {breadcrumbs.map((page, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={page.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{page.breadcrumbLabel || page.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <NavLink to={page.path}>
                      {page.breadcrumbLabel || page.title}
                    </NavLink>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
