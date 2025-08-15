import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, DollarSign, TrendingUp, AlertTriangle, Printer, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DrugData {
  id: string;
  name: string;
  unit: string;
  estimatedUnitPrice: number;
  originalQty: number;
  adjustedQty: number;
}

interface ProductCategory {
  name: string;
  drugs: DrugData[];
}

const BudgetAlignment: React.FC = () => {
  const { toast } = useToast();
  const [availableBudget, setAvailableBudget] = useState<string>("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Sample data organized by product categories
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([
    {
      name: "Antibiotics",
      drugs: [
        {
          id: "amoxicillin",
          name: "Amoxicillin 250mg Capsules",
          unit: "Capsule",
          estimatedUnitPrice: 0.12,
          originalQty: 5000,
          adjustedQty: 5000,
        },
        {
          id: "artemether",
          name: "Artemether/Lumefantrine 20/120mg",
          unit: "Tablet",
          estimatedUnitPrice: 0.35,
          originalQty: 2500,
          adjustedQty: 2500,
        },
        {
          id: "cotrimoxazole",
          name: "Cotrimoxazole 8/40mg/ml Suspension",
          unit: "Bottle",
          estimatedUnitPrice: 2.50,
          originalQty: 800,
          adjustedQty: 800,
        },
      ],
    },
    {
      name: "Analgesics & Antipyretics",
      drugs: [
        {
          id: "paracetamol-500",
          name: "Paracetamol 500mg Tablets",
          unit: "Tablet",
          estimatedUnitPrice: 0.08,
          originalQty: 8000,
          adjustedQty: 8000,
        },
        {
          id: "paracetamol-syrup",
          name: "Paracetamol 120mg/5ml Syrup",
          unit: "Bottle",
          estimatedUnitPrice: 1.20,
          originalQty: 1200,
          adjustedQty: 1200,
        },
        {
          id: "ibuprofen",
          name: "Ibuprofen 400mg Tablets",
          unit: "Tablet",
          estimatedUnitPrice: 0.15,
          originalQty: 3000,
          adjustedQty: 3000,
        },
      ],
    },
    {
      name: "IV Solutions & Electrolytes",
      drugs: [
        {
          id: "ors",
          name: "ORS Sachets",
          unit: "Sachet",
          estimatedUnitPrice: 0.25,
          originalQty: 2000,
          adjustedQty: 2000,
        },
        {
          id: "normal-saline",
          name: "Normal Saline 0.9% 500ml",
          unit: "Bag",
          estimatedUnitPrice: 1.80,
          originalQty: 1500,
          adjustedQty: 1500,
        },
        {
          id: "dextrose",
          name: "Dextrose 5% 500ml",
          unit: "Bag",
          estimatedUnitPrice: 2.10,
          originalQty: 1200,
          adjustedQty: 1200,
        },
      ],
    },
    {
      name: "Maternal Health",
      drugs: [
        {
          id: "oxytocin",
          name: "Oxytocin 10IU/ml Injection",
          unit: "Ampoule",
          estimatedUnitPrice: 0.45,
          originalQty: 500,
          adjustedQty: 500,
        },
        {
          id: "folic-acid",
          name: "Folic Acid 5mg Tablets",
          unit: "Tablet",
          estimatedUnitPrice: 0.05,
          originalQty: 2000,
          adjustedQty: 2000,
        },
        {
          id: "iron-folate",
          name: "Iron + Folate Tablets",
          unit: "Tablet",
          estimatedUnitPrice: 0.10,
          originalQty: 3000,
          adjustedQty: 3000,
        },
      ],
    },
  ]);

  const toggleCategory = (categoryName: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryName)) {
      newCollapsed.delete(categoryName);
    } else {
      newCollapsed.add(categoryName);
    }
    setCollapsedCategories(newCollapsed);
  };

  const updateDrugQuantity = (categoryIndex: number, drugIndex: number, newQty: number) => {
    const updated = [...productCategories];
    updated[categoryIndex].drugs[drugIndex].adjustedQty = newQty;
    setProductCategories(updated);
  };

  const calculateTotalCost = () => {
    return productCategories.reduce((total, category) => {
      return total + category.drugs.reduce((categoryTotal, drug) => {
        return categoryTotal + (drug.adjustedQty * drug.estimatedUnitPrice);
      }, 0);
    }, 0);
  };

  const calculateOriginalCost = () => {
    return productCategories.reduce((total, category) => {
      return total + category.drugs.reduce((categoryTotal, drug) => {
        return categoryTotal + (drug.originalQty * drug.estimatedUnitPrice);
      }, 0);
    }, 0);
  };

  const totalCost = calculateTotalCost();
  const originalCost = calculateOriginalCost();
  const budget = parseFloat(availableBudget) || 0;
  const budgetGap = budget - totalCost;
  const isOverBudget = budgetGap < 0;

  const handleSubmit = () => {
    toast({
      title: "Budget Alignment Submitted",
      description: "Your budget alignment has been submitted for review.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const resetToOriginal = () => {
    const reset = productCategories.map(category => ({
      ...category,
      drugs: category.drugs.map(drug => ({
        ...drug,
        adjustedQty: drug.originalQty,
      })),
    }));
    setProductCategories(reset);
    toast({
      title: "Values Reset",
      description: "All quantities have been reset to original forecast values.",
    });
  };

  return (
    <>
      <Helmet>
        <title>CDSS Budget Alignment - Supply Chain Management</title>
        <meta name="description" content="Align drug forecasts with available budget for CDSS program implementation" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CDSS Budget Alignment</h1>
            <p className="text-muted-foreground mt-2">
              Adjust drug quantities based on available budget for the CDSS program
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Facility: Boru Meda Hospital</p>
            <p className="text-sm text-muted-foreground">Period: FY 2024/25</p>
          </div>
        </div>

        {/* Budget Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Available Budget (ETB)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget amount"
                  value={availableBudget}
                  onChange={(e) => setAvailableBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Original Forecast Cost</Label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                  {originalCost.toLocaleString()} ETB
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adjusted Total Cost</Label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
                  {totalCost.toLocaleString()} ETB
                </div>
              </div>
              <div className="space-y-2">
                <Label>Budget Gap</Label>
                <div className={`h-10 px-3 py-2 rounded-md flex items-center font-medium ${
                  isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'
                }`}>
                  {budgetGap >= 0 ? '+' : ''}{budgetGap.toLocaleString()} ETB
                </div>
              </div>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-destructive font-medium">
                  Budget exceeded by {Math.abs(budgetGap).toLocaleString()} ETB. Adjust quantities below.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drug Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Drug Requirements by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productCategories.map((category, categoryIndex) => {
                const isCollapsed = collapsedCategories.has(category.name);
                const categoryTotal = category.drugs.reduce((sum, drug) => 
                  sum + (drug.adjustedQty * drug.estimatedUnitPrice), 0);

                return (
                  <Collapsible key={category.name} open={!isCollapsed}>
                    <CollapsibleTrigger
                      onClick={() => toggleCategory(category.name)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant="secondary">{category.drugs.length} items</Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{categoryTotal.toLocaleString()} ETB</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Drug Name</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Unit Price (ETB)</TableHead>
                              <TableHead>Original Qty</TableHead>
                              <TableHead>Adjusted Qty</TableHead>
                              <TableHead>Total Price (ETB)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.drugs.map((drug, drugIndex) => (
                              <TableRow key={drug.id}>
                                <TableCell className="font-medium">{drug.name}</TableCell>
                                <TableCell>{drug.unit}</TableCell>
                                <TableCell>{drug.estimatedUnitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {drug.originalQty.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={drug.adjustedQty}
                                    onChange={(e) => updateDrugQuantity(
                                      categoryIndex, 
                                      drugIndex, 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-24"
                                    min="0"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {(drug.adjustedQty * drug.estimatedUnitPrice).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={resetToOriginal}>
            Reset to Original
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};

export default BudgetAlignment;