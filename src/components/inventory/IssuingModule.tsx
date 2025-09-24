import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TrendingDown, Plus, CheckCircle, Clock, AlertTriangle, Eye, FileText, UserCheck } from "lucide-react";
import { ApprovalDialog } from "./ApprovalDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  department_name: string;
  department_code: string;
  facility_id: number;
}

interface StockRequest {
  id: string;
  department_id: string;
  department_name?: string;
  product_id: string;
  product_name?: string;
  requested_quantity: number;
  approved_quantity?: number;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  requested_date: string;
  requested_by: string;
  current_stock?: number;
  unit?: string;
}

interface Product {
  id: string;
  canonical_name: string;
  default_unit: string;
  current_stock?: number;
}

type ViewMode = "requests" | "new-request";

export const IssuingModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("requests");
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockBalances, setStockBalances] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    department_id: "",
    product_id: "",
    requested_quantity: "",
    urgency_level: "medium" as const,
    justification: ""
  });

  const facilityId = 1; // Would come from user context
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    fetchRequests();
    fetchDepartments();
    fetchProducts();
    fetchStockBalances();
  }, []);

  const fetchRequests = async () => {
    try {
      // Fetch recent issue transactions from the database
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('transaction_type', 'issue')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      // Get product details for the transactions
      let requestsFromTransactions: StockRequest[] = [];
      if (transactionsData && transactionsData.length > 0) {
        const productIds = [...new Set(transactionsData.map(t => t.product_id))];
        const { data: productDetails, error: productError } = await supabase
          .from('product_reference')
          .select('id, canonical_name, default_unit')
          .in('id', productIds);

        if (productError) throw productError;

        const productMap = (productDetails || []).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, any>);

        // Transform transactions to request format for display
        requestsFromTransactions = transactionsData.map(transaction => ({
          id: transaction.id,
          department_id: transaction.department || 'unknown',
          department_name: transaction.department || 'Unknown Department',
          product_id: transaction.product_id,
          product_name: productMap[transaction.product_id]?.canonical_name || 'Unknown Product',
          requested_quantity: Math.abs(transaction.quantity),
          approved_quantity: Math.abs(transaction.quantity),
          urgency_level: 'medium' as const,
          justification: transaction.notes || 'Stock issue',
          status: 'issued' as const,
          requested_date: transaction.transaction_date,
          requested_by: "System User",
          current_stock: stockBalances[transaction.product_id] || 0,
          unit: productMap[transaction.product_id]?.default_unit || 'unit'
        }));
      }

      setRequests(requestsFromTransactions);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('active_status', true);

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reference')
        .select('id, canonical_name, default_unit')
        .eq('active', true)
        .order('canonical_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStockBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_balances')
        .select('product_id, current_stock')
        .eq('facility_id', facilityId);

      if (error) throw error;

      const balancesMap = (data || []).reduce((acc, balance) => {
        acc[balance.product_id] = balance.current_stock || 0;
        return acc;
      }, {} as Record<string, number>);

      setStockBalances(balancesMap);
    } catch (error) {
      console.error('Error fetching stock balances:', error);
    }
  };

  const handleApproveRequest = async (requestId: string, approvedQuantity: number, adjustmentReason?: string) => {
    try {
      setIsProcessing(true);
      
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Create an issue transaction in the database
      const { error } = await supabase
        .from('inventory_transactions')
        .insert({
          facility_id: facilityId,
          product_id: request.product_id,
          transaction_type: 'issue',
          quantity: -approvedQuantity, // Negative for issues
          transaction_date: new Date().toISOString().split('T')[0],
          department: request.department_name,
          notes: `Approved request: ${request.justification}${adjustmentReason ? `. Adjustment: ${adjustmentReason}` : ''}`,
          reference_number: `ISS-${Date.now()}`
        });

      if (error) throw error;

      // Create adjustment transaction if approved quantity differs from requested
      if (approvedQuantity !== request.requested_quantity && adjustmentReason) {
        const adjustmentQuantity = request.requested_quantity - approvedQuantity;
        await supabase
          .from('inventory_transactions')
          .insert({
            facility_id: facilityId,
            product_id: request.product_id,
            transaction_type: 'adjustment',
            quantity: adjustmentQuantity, // Positive - reducing the issue amount
            transaction_date: new Date().toISOString().split('T')[0],
            department: request.department_name,
            notes: `Issue adjustment: ${adjustmentReason}. Requested: ${request.requested_quantity}, Approved: ${approvedQuantity}`,
            reference_number: `ADJ-ISS-${Date.now()}`
          });
      }

      // Update request status locally
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const, approved_quantity: approvedQuantity }
          : req
      );
      setRequests(updatedRequests);

      // Update stock balance locally
      const newBalance = (stockBalances[request.product_id] || 0) - approvedQuantity;
      setStockBalances(prev => ({
        ...prev,
        [request.product_id]: newBalance
      }));
      
      toast({
        title: "Request approved and issued",
        description: `${approvedQuantity} ${request.unit} of ${request.product_name} issued to ${request.department_name}`,
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve and issue stock",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitNewRequest = async () => {
    if (!newRequest.department_id || !newRequest.product_id || !newRequest.requested_quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      const departmentName = departments.find(d => d.id === newRequest.department_id)?.department_name;
      const product = products.find(p => p.id === newRequest.product_id);
      
      // For now, we'll auto-approve and issue the request
      // In a real system, this might go through an approval workflow
      const { error } = await supabase
        .from('inventory_transactions')
        .insert({
          facility_id: facilityId,
          product_id: newRequest.product_id,
          transaction_type: 'issue',
          quantity: -Number(newRequest.requested_quantity), // Negative for issues
          transaction_date: new Date().toISOString().split('T')[0],
          department: departmentName,
          notes: `${newRequest.urgency_level.toUpperCase()} priority: ${newRequest.justification}`,
          reference_number: `REQ-${Date.now()}`
        });

      if (error) throw error;

      // Update local stock balance
      const issuedQuantity = Number(newRequest.requested_quantity);
      const newBalance = (stockBalances[newRequest.product_id] || 0) - issuedQuantity;
      setStockBalances(prev => ({
        ...prev,
        [newRequest.product_id]: newBalance
      }));

      // Add to local requests list
      const request: StockRequest = {
        id: Date.now().toString(),
        department_id: newRequest.department_id,
        department_name: departmentName,
        product_id: newRequest.product_id,
        product_name: product?.canonical_name,
        requested_quantity: issuedQuantity,
        approved_quantity: issuedQuantity,
        urgency_level: newRequest.urgency_level,
        justification: newRequest.justification,
        status: 'issued',
        requested_date: new Date().toISOString().split('T')[0],
        requested_by: "Current User", // Would come from auth context
        current_stock: newBalance,
        unit: product?.default_unit
      };

      setRequests([request, ...requests]);
      setNewRequest({
        department_id: "",
        product_id: "",
        requested_quantity: "",
        urgency_level: "medium",
        justification: ""
      });
      setViewMode("requests");

      toast({
        title: "Stock issued successfully",
        description: `${issuedQuantity} ${product?.default_unit} of ${product?.canonical_name} issued to ${departmentName}`,
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to process stock issue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      emergency: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      high: { color: "bg-orange-100 text-orange-800", icon: Clock },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      low: { color: "bg-green-100 text-green-800", icon: Clock }
    };
    
    const { color, icon: Icon } = config[urgency as keyof typeof config] || config.medium;
    
    return (
      <Badge className={`${color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: "bg-blue-100 text-blue-800", text: "Pending Review" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      issued: { color: "bg-gray-100 text-gray-800", text: "Issued" }
    };
    
    const { color, text } = config[status as keyof typeof config] || config.pending;
    
    return <Badge className={`${color} border-0`}>{text}</Badge>;
  };

  if (viewMode === "new-request") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Submit Stock Request</h3>
          <Button variant="outline" onClick={() => setViewMode("requests")}>
            Back to Requests
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Stock Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department *</Label>
                <Select value={newRequest.department_id} onValueChange={(value) => setNewRequest({...newRequest, department_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Product *</Label>
                <Select value={newRequest.product_id} onValueChange={(value) => setNewRequest({...newRequest, product_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.canonical_name}
                        {stockBalances[product.id] && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (Stock: {stockBalances[product.id]})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Requested Quantity *</Label>
                <Input
                  type="number"
                  value={newRequest.requested_quantity}
                  onChange={(e) => setNewRequest({...newRequest, requested_quantity: e.target.value})}
                  placeholder="Enter quantity"
                />
                {newRequest.product_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {stockBalances[newRequest.product_id] || 0} {products.find(p => p.id === newRequest.product_id)?.default_unit}
                  </p>
                )}
              </div>

              <div>
                <Label>Urgency Level</Label>
                <Select value={newRequest.urgency_level} onValueChange={(value: any) => setNewRequest({...newRequest, urgency_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Justification</Label>
              <Textarea
                value={newRequest.justification}
                onChange={(e) => setNewRequest({...newRequest, justification: e.target.value})}
                placeholder="Explain why this stock is needed..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewMode("requests")}>
                Cancel
              </Button>
              <Button onClick={handleSubmitNewRequest} disabled={isProcessing}>
                {isProcessing ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <ApprovalDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          request={selectedRequest}
          onApprove={handleApproveRequest}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Stock Requests Management</h3>
          <p className="text-sm text-muted-foreground">Review and approve department stock requests</p>
        </div>
        <Button onClick={() => setViewMode("new-request")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Emergency</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.urgency_level === 'emergency').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Issued</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {requests.filter(r => r.status === 'issued').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <RequestRow 
                  key={request.id} 
                  request={request}
                  onApprove={handleApproveRequest}
                  isProcessing={isProcessing}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface RequestRowProps {
  request: StockRequest;
  onApprove: (requestId: string, approvedQuantity: number) => void;
  isProcessing: boolean;
}

const RequestRow: React.FC<RequestRowProps> = ({ request, onApprove, isProcessing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [approvedQuantity, setApprovedQuantity] = useState(request.requested_quantity);

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      emergency: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      high: { color: "bg-orange-100 text-orange-800", icon: Clock },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      low: { color: "bg-green-100 text-green-800", icon: Clock }
    };
    
    const { color, icon: Icon } = config[urgency as keyof typeof config] || config.medium;
    
    return (
      <Badge className={`${color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: "bg-blue-100 text-blue-800", text: "Pending Review" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      issued: { color: "bg-gray-100 text-gray-800", text: "Issued" }
    };
    
    const { color, text } = config[status as keyof typeof config] || config.pending;
    
    return <Badge className={`${color} border-0`}>{text}</Badge>;
  };

  return (
    <TableRow>
      <TableCell className="text-sm">{request.requested_date}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{request.department_name}</div>
          <div className="text-xs text-muted-foreground">By: {request.requested_by}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{request.product_name}</div>
          <div className="text-xs text-muted-foreground">{request.unit}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{request.requested_quantity.toLocaleString()}</div>
          {request.approved_quantity && request.approved_quantity !== request.requested_quantity && (
            <div className="text-xs text-green-600">Approved: {request.approved_quantity}</div>
          )}
        </div>
      </TableCell>
      <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
      <TableCell>{getStatusBadge(request.status)}</TableCell>
      <TableCell>
        <div className="text-sm">
          <div className={`font-medium ${(request.current_stock || 0) < request.requested_quantity ? 'text-red-600' : 'text-green-600'}`}>
            {(request.current_stock || 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {(request.current_stock || 0) >= request.requested_quantity ? "Available" : "Insufficient"}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {request.status === 'pending' && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Input
                  type="number"
                  value={approvedQuantity}
                  onChange={(e) => setApprovedQuantity(Number(e.target.value))}
                  className="w-20"
                  max={request.current_stock}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    onApprove(request.id, approvedQuantity);
                    setIsEditing(false);
                  }}
                  disabled={isProcessing || approvedQuantity > (request.current_stock || 0)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <UserCheck className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};