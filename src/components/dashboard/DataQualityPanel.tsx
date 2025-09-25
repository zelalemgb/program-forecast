import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  Edit3,
  CheckCircle,
  Database,
  Package,
  Building,
  Barcode
} from "lucide-react";

interface DataQualityIssue {
  id: string;
  type: 'duplicate' | 'missing' | 'invalid';
  entity: 'product' | 'facility' | 'mapping';
  description: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
}

interface MasterDataItem {
  id: string;
  name: string;
  code?: string;
  type: 'product' | 'facility';
  packSize?: string;
  uom?: string;
  barcode?: string;
  canEdit: boolean;
}

const mockIssues: DataQualityIssue[] = [
  { id: '1', type: 'duplicate', entity: 'product', description: 'Duplicate product names found', severity: 'high', count: 7 },
  { id: '2', type: 'missing', entity: 'product', description: 'Missing pack sizes', severity: 'medium', count: 23 },
  { id: '3', type: 'invalid', entity: 'facility', description: 'Invalid facility codes', severity: 'medium', count: 4 },
  { id: '4', type: 'missing', entity: 'mapping', description: 'Unmapped barcodes', severity: 'low', count: 12 }
];

const mockMasterData: MasterDataItem[] = [
  { id: 'p1', name: 'Paracetamol Tablets', code: 'PAR500', type: 'product', packSize: '100 tablets', uom: 'box', barcode: '123456789', canEdit: true },
  { id: 'p2', name: 'Oxytocin Injection', code: 'OXY10', type: 'product', packSize: '10 vials', uom: 'vial', canEdit: true },
  { id: 'f1', name: 'Debre Berhan Health Center', code: 'DBHC001', type: 'facility', canEdit: false }
];

export default function DataQualityPanel() {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4" />;
      case 'facility': return <Building className="h-4 w-4" />;
      case 'mapping': return <Barcode className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const handleEditItem = (item: MasterDataItem) => {
    setSelectedItem(item);
    setIsEditSheetOpen(true);
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    setIsEditSheetOpen(false);
    setSelectedItem(null);
  };

  return (
    <Card className="surface border-border/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-foreground">Data Quality & Exceptions</h2>
          </div>
          <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Master Data
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Master Data Quick Edit</SheetTitle>
                <SheetDescription>
                  Fix product names, pack sizes, UoM, and barcode mappings
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-4">
                {mockMasterData.map((item) => (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {item.type === 'product' && (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Pack Size</Label>
                              <div>{item.packSize}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">UoM</Label>
                              <div>{item.uom}</div>
                            </div>
                          </div>
                          {item.barcode && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Barcode</Label>
                              <div className="font-mono text-xs">{item.barcode}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedItem?.id === item.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div>
                            <Label htmlFor="itemName">Name</Label>
                            <Input
                              id="itemName"
                              defaultValue={item.name}
                              className="mt-1"
                            />
                          </div>
                          {item.type === 'product' && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="packSize">Pack Size</Label>
                                  <Input
                                    id="packSize"
                                    defaultValue={item.packSize}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="uom">UoM</Label>
                                  <Input
                                    id="uom"
                                    defaultValue={item.uom}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                  id="barcode"
                                  defaultValue={item.barcode}
                                  className="mt-1"
                                />
                              </div>
                            </>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveChanges}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-3">
          {mockIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                {getTypeIcon(issue.entity)}
                <div>
                  <div className="text-sm font-medium">{issue.description}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {issue.entity} • {issue.type}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                  {issue.count} items
                </Badge>
                <Button variant="ghost" size="sm">
                  Fix
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Quality score improves with fewer exceptions. Regular cleanup reduces support tickets.
        </div>
      </CardContent>
    </Card>
  );
}