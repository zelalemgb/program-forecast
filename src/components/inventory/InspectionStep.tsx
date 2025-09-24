import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";

interface ReceivedItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  packSize?: number;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  supplier?: string;
  actualQuantity?: number;
  adjustmentReason?: string;
  conditionAtReceipt?: string;
  hasAdjustment?: boolean;
}

interface InspectionStepProps {
  receivedItems: ReceivedItem[];
  stockBalances: Record<string, number>;
  updateItemAdjustment: (itemId: string, field: string, value: any) => void;
  onProceedToComplete: () => void;
  onBackToEntry: () => void;
}

const adjustmentReasons = [
  { value: "damaged", label: "Damaged items" },
  { value: "expired", label: "Expired items" },
  { value: "count_discrepancy", label: "Count discrepancy" },
  { value: "wrong_product", label: "Wrong product received" },
  { value: "packaging_issue", label: "Packaging issues" },
  { value: "quality_issue", label: "Quality concerns" },
  { value: "unit_conversion", label: "Unit conversion" },
  { value: "other", label: "Other" }
];

const conditionOptions = [
  { value: "good", label: "Good condition" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "near_expiry", label: "Near expiry" },
  { value: "poor_packaging", label: "Poor packaging" }
];

export const InspectionStep: React.FC<InspectionStepProps> = ({
  receivedItems,
  stockBalances,
  updateItemAdjustment,
  onProceedToComplete,
  onBackToEntry
}) => {
  const getTotalAdjustments = () => {
    return receivedItems.filter(item => item.hasAdjustment).length;
  };

  const getAdjustmentImpact = (item: ReceivedItem) => {
    if (!item.hasAdjustment || item.actualQuantity === undefined) return 0;
    return item.actualQuantity - item.quantity;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Inspection & Verification</h3>
          <p className="text-sm text-muted-foreground">
            Verify received quantities and record any discrepancies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackToEntry}>
            Back to Entry
          </Button>
          <Button onClick={onProceedToComplete}>
            Complete Receiving
          </Button>
        </div>
      </div>

      {/* Inspection Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{receivedItems.length}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-semibold text-orange-600">{getTotalAdjustments()}</div>
                <div className="text-xs text-muted-foreground">Adjustments</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {receivedItems.length - getTotalAdjustments()}
                </div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Table */}
      <Card>
        <CardHeader>
          <CardTitle>Item Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Expected Qty</TableHead>
                <TableHead>Actual Qty</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Adjustment Reason</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>New Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedItems.map((item) => {
                const currentStock = stockBalances[item.productId] || 0;
                const actualQty = item.actualQuantity ?? item.quantity;
                const newBalance = currentStock + actualQty;
                const adjustment = getAdjustmentImpact(item);
                
                return (
                  <TableRow key={item.id} className={item.hasAdjustment ? "bg-orange-50" : ""}>
                    <TableCell>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        Batch: {item.batchNumber || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.quantity.toLocaleString()} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={actualQty}
                        onChange={(e) => updateItemAdjustment(item.id, 'actualQuantity', Number(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.conditionAtReceipt || "good"} 
                        onValueChange={(value) => updateItemAdjustment(item.id, 'conditionAtReceipt', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {item.hasAdjustment && (
                        <Select 
                          value={item.adjustmentReason || ""} 
                          onValueChange={(value) => updateItemAdjustment(item.id, 'adjustmentReason', value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {adjustmentReasons.map((reason) => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {adjustment !== 0 && (
                        <Badge variant={adjustment > 0 ? "default" : "destructive"}>
                          {adjustment > 0 ? "+" : ""}{adjustment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-green-600">
                          {newBalance.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Was: {currentStock.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};