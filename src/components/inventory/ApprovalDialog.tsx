import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";

interface StockRequest {
  id: string;
  department_name?: string;
  product_name?: string;
  requested_quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  justification: string;
  current_stock?: number;
  unit?: string;
}

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: StockRequest | null;
  onApprove: (requestId: string, approvedQuantity: number, adjustmentReason?: string) => void;
}

const adjustmentReasons = [
  { value: "insufficient_stock", label: "Insufficient stock available" },
  { value: "emergency_reserve", label: "Maintaining emergency reserve" },
  { value: "expired_stock", label: "Some stock expired" },
  { value: "quality_issue", label: "Quality concerns" },
  { value: "alternative_product", label: "Alternative product available" },
  { value: "usage_optimization", label: "Usage optimization" },
  { value: "other", label: "Other reason" }
];

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  request,
  onApprove
}) => {
  const [approvedQuantity, setApprovedQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  React.useEffect(() => {
    if (request) {
      setApprovedQuantity(request.requested_quantity);
      setAdjustmentReason("");
      setCustomReason("");
    }
  }, [request]);

  if (!request) return null;

  const hasAdjustment = approvedQuantity !== request.requested_quantity;
  const stockAfterIssue = (request.current_stock || 0) - approvedQuantity;
  const isStockCritical = stockAfterIssue < 10; // Assuming 10 as critical threshold

  const handleApprove = () => {
    const finalReason = adjustmentReason === "other" ? customReason : adjustmentReason;
    onApprove(request.id, approvedQuantity, hasAdjustment ? finalReason : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Stock Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{request.product_name}</div>
                <div className="text-sm text-muted-foreground">{request.department_name}</div>
              </div>
              <Badge variant={request.urgency_level === 'emergency' ? 'destructive' : 'outline'}>
                {request.urgency_level.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm">
              <strong>Requested:</strong> {request.requested_quantity} {request.unit}
            </div>
            <div className="text-sm">
              <strong>Available:</strong> {request.current_stock || 0} {request.unit}
            </div>
            <div className="text-sm">
              <strong>Justification:</strong> {request.justification}
            </div>
          </div>

          {/* Approval Quantity */}
          <div>
            <Label htmlFor="approved-quantity">Approved Quantity *</Label>
            <Input
              id="approved-quantity"
              type="number"
              value={approvedQuantity}
              onChange={(e) => setApprovedQuantity(Number(e.target.value))}
              max={request.current_stock || 0}
              min={0}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Max available: {request.current_stock || 0} {request.unit}
            </div>
          </div>

          {/* Stock Impact Warning */}
          {isStockCritical && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-800">Low Stock Warning</div>
                <div className="text-orange-700">
                  Stock will be {stockAfterIssue} {request.unit} after this issue
                </div>
              </div>
            </div>
          )}

          {/* Adjustment Reason (if quantity differs) */}
          {hasAdjustment && (
            <div className="space-y-3">
              <Label>Adjustment Reason *</Label>
              <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for quantity change" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {adjustmentReason === "other" && (
                <div>
                  <Label htmlFor="custom-reason">Custom Reason</Label>
                  <Textarea
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Explain the reason for adjustment..."
                    rows={2}
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Adjustment Summary</div>
                  <div className="text-blue-700">
                    Requested: {request.requested_quantity} {request.unit} → 
                    Approved: {approvedQuantity} {request.unit}
                    {approvedQuantity < request.requested_quantity ? (
                      <span className="text-red-600"> (-{request.requested_quantity - approvedQuantity})</span>
                    ) : (
                      <span className="text-green-600"> (+{approvedQuantity - request.requested_quantity})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={hasAdjustment && !adjustmentReason}
          >
            Approve & Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};