import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PackageOpen, Timer } from "lucide-react";

interface KPIsProps {
  stockouts?: number;
  lowStock?: number;
  overstock?: number;
  nearExpiry?: number;
}

const num = (n?: number) => (n ?? 0).toLocaleString();

const KPICards: React.FC<KPIsProps> = ({ stockouts = 0, lowStock = 0, overstock = 0, nearExpiry = 0 }) => {
  const items = [
    { label: "Stockouts", value: stockouts, Icon: AlertTriangle },
    { label: "Low stock", value: lowStock, Icon: PackageOpen },
    { label: "Overstock", value: overstock, Icon: PackageOpen },
    { label: "Near-expiry", value: nearExpiry, Icon: Timer },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="surface">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-2xl font-semibold">{num(value)}</div>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
