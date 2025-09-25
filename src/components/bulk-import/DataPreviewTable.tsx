import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, XCircle } from "lucide-react";

interface DataQualityIssue {
  rowIndex: number;
  issues: string[];
  severity: 'error' | 'warning';
}

interface SheetData {
  headers: string[];
  rows: any[][];
}

interface DataPreviewTableProps {
  currentSheetData: SheetData;
  dataQualityIssues: DataQualityIssue[];
  maxPreviewRows?: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  currentSheetData,
  dataQualityIssues,
  maxPreviewRows = 50
}) => {
  return (
    <div className="flex-1 border rounded-lg p-4 min-h-0">
      <h4 className="font-medium text-sm mb-3">
        Data Preview ({currentSheetData.rows.length} rows)
      </h4>
      <div className="overflow-auto h-full">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-12 text-xs">#</TableHead>
              {currentSheetData.headers.map((header, index) => (
                <TableHead key={index} className="text-xs min-w-20">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSheetData.rows.slice(0, maxPreviewRows).map((row, rowIndex) => {
              const hasIssues = dataQualityIssues.some(issue => issue.rowIndex === rowIndex);
              const isError = dataQualityIssues.some(issue => issue.rowIndex === rowIndex && issue.severity === 'error');
              
              return (
                <TableRow 
                  key={rowIndex} 
                  className={hasIssues ? (isError ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10') : ''}
                >
                  <TableCell className="text-xs font-mono">
                    <div className="flex items-center gap-1">
                      {rowIndex + 1}
                      {hasIssues && (
                        <div className="flex items-center">
                          {isError ? (
                            <XCircle className="h-3 w-3 text-red-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-xs max-w-32 truncate">
                      {cell?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {currentSheetData.rows.length > maxPreviewRows && (
          <div className="text-center text-xs text-muted-foreground py-2">
            Showing first {maxPreviewRows} rows of {currentSheetData.rows.length} total rows
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreviewTable;