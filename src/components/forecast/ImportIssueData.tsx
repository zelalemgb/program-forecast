import React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface IssueDataRow {
  "Program": string;
  "Items Description": string;
  "Unit": string;
  "Quantity": string;
  "Year": string;
}

interface ImportIssueDataProps {
  onData?: () => void;
}

const SAMPLE_CSV_HEADERS = [
  "Program",
  "Items Description", 
  "Unit",
  "Quantity",
  "Year",
];

const SAMPLE_CSV = `Program,Items Description,Unit,Quantity,Year
Family Planning,Amoxicillin125mg Dispersible Tablet,10X10,50414,2021/22
Family Planning,Amoxicillin 250mg Dispersible Tablet,10X10,232802,2021/22
Family Planning,Ampicillin 250mg Injection,50,35255,2021/22
Family Planning,Chlorhexidine 4% Gel,21gm,519007,2021/22`;

const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const ImportIssueData: React.FC<ImportIssueDataProps> = ({ onData }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [userRole, setUserRole] = React.useState<'admin' | 'analyst' | 'viewer' | null>(null);

  const isAuthenticated = !!session?.user;
  const isAdmin = userRole === 'admin';

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!session?.user) { setUserRole(null); return; }
    setTimeout(async () => {
      const { data, error } = await supabase.rpc('get_current_user_role');
      if (!error) setUserRole(data as any);
    }, 0);
  }, [session?.user?.id]);

  const handleFile = (file: File) => {
    // Handle Excel files
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            toast({
              title: "Empty file",
              description: "The Excel file appears to be empty.",
            });
            return;
          }
          
          // Convert to CSV-like structure for processing
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          processData(headers, rows);
        } catch (error) {
          console.error("Excel parsing error:", error);
          toast({
            title: "Excel parsing failed",
            description: "Could not read the Excel file. Please check the file format.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // Handle CSV files
    Papa.parse<IssueDataRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      delimiter: "",  // Auto-detect delimiter
      newline: "",    // Auto-detect newline
      quoteChar: '"',
      escapeChar: '"',
      comments: false,
      complete: (results) => {
        console.log("Parse results:", results);
        console.log("Headers found:", results.meta.fields);
        console.log("Expected headers:", SAMPLE_CSV_HEADERS);
        console.log("Data rows:", results.data.length);
        
        if (results.errors?.length) {
          console.error("Parse errors:", results.errors);
          // Filter out common non-critical parsing warnings
          const criticalErrors = results.errors.filter(e => 
            e.type !== "Quotes" && 
            e.type !== "FieldMismatch" && 
            e.code !== "InvalidQuotes" &&
            e.code !== "TooFewFields" &&
            e.code !== "TooManyFields"
          );
          if (criticalErrors.length > 0) {
            toast({
              title: "Import warning",
              description: `Some rows had parsing issues. Processed ${results.data.length} rows.`,
            });
          }
        }

        processData(results.meta.fields || [], results.data as IssueDataRow[]);
      },
    });
  };

  const processData = (headers: string[], rows: IssueDataRow[]) => {
    // Validate headers - be more flexible with header matching
    const normalizedHeaders = headers.map(h => String(h).trim().toLowerCase());
    const normalizedExpected = SAMPLE_CSV_HEADERS.map(h => h.toLowerCase());
    
    const missing = normalizedExpected.filter((h) => !normalizedHeaders.includes(h));
    if (missing.length) {
      toast({
        title: "Invalid file format",
        description: `Missing columns: ${missing.join(", ")}. Found: ${headers.join(", ")}. Please ensure your file has the exact column names from the template.`,
      });
      return;
    }

    // Transform rows
    const transformedRows = rows.map((r) => ({
      user_id: session?.user?.id,
      program: String(r["Program"] || "").trim(),
      items_description: String(r["Items Description"] || "").trim(),
      unit: r["Unit"] ? String(r["Unit"]) : null,
      quantity: parseNumber(r["Quantity"]),
      year: r["Year"] ? String(r["Year"]) : null,
    }));

    (async () => {
      try {
        // Check for existing records to avoid duplicates
        const { data: existingRecords, error: fetchError } = await supabase
          .from("product_issues")
          .select("program, items_description, unit, year, user_id");

        if (fetchError) {
          toast({ title: "Error checking duplicates", description: fetchError.message });
          return;
        }

        // Filter out duplicates
        const newRecords = transformedRows.filter(newRow => {
          return !existingRecords?.some(existingRow => 
            existingRow.program === newRow.program &&
            existingRow.items_description === newRow.items_description &&
            existingRow.unit === newRow.unit &&
            existingRow.year === newRow.year &&
            existingRow.user_id === newRow.user_id
          );
        });

        if (newRecords.length === 0) {
          toast({ 
            title: "No new records", 
            description: "All records already exist in the database. No duplicates imported." 
          });
          return;
        }

        // Insert only new records
        const { error } = await supabase.from("product_issues").insert(newRecords);
        if (error) {
          toast({ title: "Database insert failed", description: error.message });
        } else {
          const duplicateCount = transformedRows.length - newRecords.length;
          const message = duplicateCount > 0 
            ? `${newRecords.length} new records imported, ${duplicateCount} duplicates skipped.`
            : `${newRecords.length} issue records imported.`;
          
          toast({ title: "Import successful", description: message });
          onData?.();
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Import failed", description: "An unexpected error occurred during import." });
      }
    })();
  };

  const onUploadClick = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to upload issue data." });
      return;
    }
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issue-data-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = async () => {
    if (!isAdmin) {
      toast({ title: "Not authorized", description: "Only admins can clear all issue data." });
      return;
    }
    const { error } = await supabase.from("product_issues").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast({ title: "Clear failed", description: error.message });
    } else {
      toast({ title: "Table cleared", description: "All issue data has been deleted." });
    }
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle>Import Issue Data</CardTitle>
        <CardDescription>Upload CSV with product issues matching the provided template.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button variant="default" onClick={onUploadClick} disabled={!isAuthenticated}>
          Upload CSV/Excel
        </Button>
        <Button variant="secondary" onClick={downloadTemplate}>
          Download Template
        </Button>
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Clear Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all issue data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all product issue records and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearData}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportIssueData;