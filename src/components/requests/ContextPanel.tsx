import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  budgetRemaining?: number;
  forecastBalance?: number;
  psmPercent?: number;
};

const numberFmt = (n: number | undefined) => (n ?? 0).toLocaleString();

const ContextPanel: React.FC<Props> = ({ budgetRemaining = 0, forecastBalance = 0, psmPercent = 0 }) => {
  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Budget Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{numberFmt(budgetRemaining)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Forecast Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{numberFmt(forecastBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>PSM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{psmPercent}%</div>
          <p className="text-sm text-muted-foreground mt-2">Applied to sum of line subtotals when calculating request total.</p>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ContextPanel;
