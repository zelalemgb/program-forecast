import React from "react";
import { useLocation } from "react-router-dom";
import TopFilterBar from "@/components/layout/TopFilterBar";

// Renders the global TopFilterBar only on routes that don't have page-specific filters
const LayoutTopBar: React.FC = () => {
  const { pathname } = useLocation();

  const hideOn = [
    /^\/$/,
    /^\/dashboard/,
    /^\/validation/,
    /^\/requests(\/|$)/,
    /^\/program-settings/,
    /^\/register/,
    /^\/auth/,
    /^\/profile/,
  ];

  const shouldHide = hideOn.some((re) => re.test(pathname));
  if (shouldHide) return null;

  return <TopFilterBar />;
};

export default LayoutTopBar;
