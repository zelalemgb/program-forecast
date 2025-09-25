import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
  rowsPerPage?: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  currentSheetData,
  dataQualityIssues,
  rowsPerPage = 25
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort rows to prioritize those with quality issues
  const sortedRowsWithIndices = useMemo(() => {
    return currentSheetData.rows.map((row, originalIndex) => ({
      row,
      originalIndex,
      hasIssues: dataQualityIssues.some(issue => issue.rowIndex === originalIndex),
      isError: dataQualityIssues.some(issue => issue.rowIndex === originalIndex && issue.severity === 'error'),
      issues: dataQualityIssues.find(issue => issue.rowIndex === originalIndex)?.issues || []
    })).sort((a, b) => {
      // Sort by: errors first, then warnings, then normal rows
      if (a.isError && !b.isError) return -1;
      if (!a.isError && b.isError) return 1;
      if (a.hasIssues && !b.hasIssues) return -1;
      if (!a.hasIssues && b.hasIssues) return 1;
      return a.originalIndex - b.originalIndex;
    });
  }, [currentSheetData.rows, dataQualityIssues]);

  const totalPages = Math.ceil(sortedRowsWithIndices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = sortedRowsWithIndices.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex-1 border rounded-lg p-4 min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">
          Data Preview ({sortedRowsWithIndices.length} rows)
          {dataQualityIssues.length > 0 && (
            <span className="text-amber-600 ml-2">
              ({dataQualityIssues.filter(i => i.severity === 'error').length} errors, {dataQualityIssues.filter(i => i.severity === 'warning').length} warnings)
            </span>
          )}
        </h4>
        
        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, sortedRowsWithIndices.length)} of {sortedRowsWithIndices.length} rows
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-16 text-xs">#</TableHead>
              <TableHead className="w-12 text-xs">Status</TableHead>
              {currentSheetData.headers.map((header, index) => (
                <TableHead key={index} className="text-xs min-w-20">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map(({ row, originalIndex, hasIssues, isError, issues }, displayIndex) => (
              <TableRow 
                key={`${originalIndex}-${displayIndex}`}
                className={hasIssues ? (isError ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10') : ''}
                title={issues.length > 0 ? issues.join('; ') : undefined}
              >
                <TableCell className="text-xs font-mono">
                  {originalIndex + 1}
                </TableCell>
                <TableCell className="text-xs">
                  {hasIssues && (
                    <div className="flex items-center">
                      {isError ? (
                        <XCircle className="h-3 w-3 text-red-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  )}
                </TableCell>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-xs max-w-32 truncate">
                    {cell?.toString() || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreviewTable;