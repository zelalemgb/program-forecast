import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import InventoryLaunchBoard from "@/components/inventory/InventoryLaunchBoard";

const Dagu: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <>
      <Helmet>
        <title>Dagu – Inventory Management | Forlab+</title>
        <meta
          name="description"
          content="Simple, efficient inventory management system for rural health centers."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <InventoryLaunchBoard />
    </>
  );
};

export default Dagu;