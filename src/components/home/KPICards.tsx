import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PackageOpen, Timer } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useUserRole } from "@/hooks/useUserRole";

interface KPIsProps {
  stockouts?: number;
  lowStock?: number;
  overstock?: number;
  nearExpiry?: number;
}

const num = (n?: number) => (n ?? 0).toLocaleString();

const KPICards: React.FC<KPIsProps> = ({ 
  stockouts: propStockouts, 
  lowStock: propLowStock, 
  overstock: propOverstock, 
  nearExpiry: propNearExpiry 
}) => {
  const { userRole } = useUserRole();
  const { balances, loading } = useInventoryData(userRole?.facility_id);

  // Calculate real KPIs from database
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
    
    // For near expiry, we'd need expiry date data which isn't in current schema
    const nearExpiry = 0; // TODO: Add expiry tracking

    return { stockouts, lowStock, overstock, nearExpiry };
  }, [balances]);

  // Use real data if available, otherwise fall back to props
  const kpis = loading ? 
    { stockouts: 0, lowStock: 0, overstock: 0, nearExpiry: 0 } :
    {
      stockouts: propStockouts ?? realKPIs.stockouts,
      lowStock: propLowStock ?? realKPIs.lowStock,
      overstock: propOverstock ?? realKPIs.overstock,
      nearExpiry: propNearExpiry ?? realKPIs.nearExpiry,
    };

  const items = [
    { label: "Stockouts", value: kpis.stockouts, Icon: AlertTriangle, color: "text-red-600" },
    { label: "Low stock", value: kpis.lowStock, Icon: PackageOpen, color: "text-amber-600" },
    { label: "Overstock", value: kpis.overstock, Icon: PackageOpen, color: "text-blue-600" },
    { label: "Near-expiry", value: kpis.nearExpiry, Icon: Timer, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, Icon, color }) => (
        <Card key={label} className="surface">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className={`text-2xl font-semibold ${loading ? 'text-muted-foreground' : color}`}>
                  {loading ? "..." : num(value)}
                </div>
              </div>
              <Icon className={`h-5 w-5 ${loading ? 'text-muted-foreground' : color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
