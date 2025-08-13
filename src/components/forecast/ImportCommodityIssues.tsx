import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Papa from "papaparse";
import { Download, Upload, Trash2 } from "lucide-react";

interface CommodityIssueRow {
  Program: string;
  "Items Description": string;
  Unit: string;
  Quantity: number;
  Year: string;
}

interface ImportCommodityIssuesProps {
  onDataImported?: () => void;
}

const ImportCommodityIssues: React.FC<ImportCommodityIssuesProps> = ({ onDataImported }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const validateHeaders = (headers: string[]): boolean => {
    const requiredHeaders = ["Program", "Items Description", "Unit", "Quantity", "Year"];
    return requiredHeaders.every(header => headers.includes(header));
  };

  const parseNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "").trim();
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : 0;
    }
    return 0;
  };

  const handleFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to import commodity issue data.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      Papa.parse<CommodityIssueRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              console.warn("CSV parse warnings:", results.errors);
            }

            const headers = Object.keys(results.data[0] || {});
            if (!validateHeaders(headers)) {
              toast({
                title: "Invalid CSV format",
                description: "CSV must contain columns: Program, Items Description, Unit, Quantity, Year",
                variant: "destructive",
              });
              return;
            }

            // Transform and validate data
            const commodityIssues = results.data.map((row) => ({
              program: row.Program?.trim() || "Unknown",
              item_description: row["Items Description"]?.trim() || "Unknown",
              unit: row.Unit?.trim() || "",
              quantity: parseNumber(row.Quantity),
              year: row.Year?.toString().trim() || "",
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            // Save to database
            const { error } = await supabase
              .from("commodity_issues")
              .insert(commodityIssues);

            if (error) {
              console.error("Database error:", error);
              toast({
                title: "Import failed",
                description: "Failed to save data to database. Please try again.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "Import successful",
              description: `Imported ${commodityIssues.length} commodity issue records.`,
            });

            onDataImported?.();
          } catch (error) {
            console.error("Processing error:", error);
            toast({
              title: "Import failed",
              description: "An error occurred while processing the file.",
              variant: "destructive",
            });
          } finally {
            setUploading(false);
          }
        },
        error: (error) => {
          console.error("CSV parse error:", error);
          toast({
            title: "File parse error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
          setUploading(false);
        },
      });
    } catch (error) {
      console.error("File handling error:", error);
      toast({
        title: "File error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const onUploadClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to import data.",
        variant: "destructive",
      });
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Program: "Family Planning",
        "Items Description": "Amoxicillin 125mg Dispersible Tablet",
        Unit: "10X10",
        Quantity: "50,414",
        Year: "2021/22"
      },
      {
        Program: "Family Planning", 
        "Items Description": "Amoxicillin 250mg Dispersible Tablet",
        Unit: "10X10",
        Quantity: "232,802",
        Year: "2021/22"
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "commodity_issues_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearData = async () => {
    if (!user) return;

    setClear(true);
    try {
      const { error } = await supabase
        .from("commodity_issues")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) {
        toast({
          title: "Clear failed",
          description: "Failed to clear commodity issue data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Data cleared",
          description: "All commodity issue data has been cleared.",
        });
        onDataImported?.();
      }
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "An error occurred while clearing data.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Commodity Issues
        </CardTitle>
        <CardDescription>
          Upload commodity issue data in CSV format: Program, Items Description, Unit, Quantity, Year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={onUploadClick} 
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload CSV"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={clearing}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all commodity issue data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All commodity issue records will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Expected CSV format:</p>
          <code className="bg-muted p-2 rounded text-xs block">
            Program,Items Description,Unit,Quantity,Year<br/>
            Family Planning,Amoxicillin 125mg Dispersible Tablet,10X10,50414,2021/22
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportCommodityIssues;