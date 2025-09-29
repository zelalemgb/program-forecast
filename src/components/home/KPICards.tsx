import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PackageOpen, Timer } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { LucideIcon } from "lucide-react";

export interface KPIItem {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  color?: string;
}

interface KPIsProps {
  stockouts?: number;
  lowStock?: number;
  overstock?: number;
  nearExpiry?: number;
  items?: KPIItem[];
  isLoading?: boolean;
}

const num = (n?: number | string) => {
  if (typeof n === "string") {
    return n;
  }

  return (n ?? 0).toLocaleString();
};

const KPICards: React.FC<KPIsProps> = ({
  stockouts: propStockouts,
  lowStock: propLowStock,
  overstock: propOverstock,
  nearExpiry: propNearExpiry,
  items,
  isLoading,
}) => {
  const { facilityId } = useCurrentUser();
  const { balances, loading: inventoryLoading } = useInventoryData(facilityId ?? undefined);

  const hasCustomItems = Boolean(items && items.length > 0);
  const loading = isLoading ?? (hasCustomItems ? false : inventoryLoading);

  const realKPIs = React.useMemo(() => {
    if (!balances || balances.length === 0) {
      return { stockouts: 0, lowStock: 0, overstock: 0, nearExpiry: 0 };
    }

    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const lowStock = balances.filter(b =>
      b.current_stock > 0 && b.current_stock <= b.reorder_level
    ).length;
    const overstock = balances.filter(b =>
      b.current_stock > b.max_level
    ).length;

    const nearExpiry = 0;

    return { stockouts, lowStock, overstock, nearExpiry };
  }, [balances]);

  const derivedItems: KPIItem[] = React.useMemo(() => {
    if (hasCustomItems && items) {
      return items;
    }

    const kpis = loading
      ? { stockouts: 0, lowStock: 0, overstock: 0, nearExpiry: 0 }
      : {
          stockouts: propStockouts ?? realKPIs.stockouts,
          lowStock: propLowStock ?? realKPIs.lowStock,
          overstock: propOverstock ?? realKPIs.overstock,
          nearExpiry: propNearExpiry ?? realKPIs.nearExpiry,
        };

    return [
      { label: "Stockouts", value: kpis.stockouts, Icon: AlertTriangle, color: "text-red-600" },
      { label: "Low stock", value: kpis.lowStock, Icon: PackageOpen, color: "text-amber-600" },
      { label: "Overstock", value: kpis.overstock, Icon: PackageOpen, color: "text-blue-600" },
      { label: "Near-expiry", value: kpis.nearExpiry, Icon: Timer, color: "text-orange-600" },
    ];
  }, [hasCustomItems, items, loading, propStockouts, propLowStock, propOverstock, propNearExpiry, realKPIs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {derivedItems.map(({ label, value, Icon, color }) => (
        <Card key={label} className="surface">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className={`text-2xl font-semibold ${loading ? "text-muted-foreground" : color ?? ""}`}>
                  {loading ? "..." : num(value)}
                </div>
              </div>
              <Icon className={`h-5 w-5 ${loading ? "text-muted-foreground" : color ?? ""}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
