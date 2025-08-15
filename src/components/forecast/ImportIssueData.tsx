import React from "react";
import Papa from "papaparse";
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
    Papa.parse<IssueDataRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      delimiter: ",",
      newline: "\n",
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        console.log("Parse results:", results);
        console.log("Headers found:", results.meta.fields);
        console.log("Expected headers:", SAMPLE_CSV_HEADERS);
        
        if (results.errors?.length) {
          console.error("Parse errors:", results.errors);
          // Only show error if there are actual data issues, not parsing warnings
          const criticalErrors = results.errors.filter(e => e.type !== "Quotes" && e.type !== "FieldMismatch");
          if (criticalErrors.length > 0) {
            toast({
              title: "Import warning",
              description: `Some rows had issues. Processed ${results.data.length} rows.`,
            });
          }
        }

        // Validate headers
        const headers = results.meta.fields || [];
        const missing = SAMPLE_CSV_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length) {
          toast({
            title: "Invalid file format",
            description: `Missing columns: ${missing.join(", ")}. Found: ${headers.join(", ")}`,
          });
          return;
        }

        // Transform and insert rows into Supabase
        const rows = (results.data as IssueDataRow[]).map((r) => ({
          user_id: session?.user?.id,
          program: String(r["Program"] || "").trim(),
          items_description: String(r["Items Description"] || "").trim(),
          unit: r["Unit"] ? String(r["Unit"]) : null,
          quantity: parseNumber(r["Quantity"]),
          year: r["Year"] ? String(r["Year"]) : null,
        }));

        (async () => {
          const { error } = await supabase.from("product_issues").insert(rows);
          if (error) {
            toast({ title: "Database insert failed", description: error.message });
          } else {
            toast({ title: "Import successful", description: `${rows.length} issue records imported.` });
            onData?.();
          }
        })().catch((e) => console.error(e));
      },
    });
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