import React, { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  XCircle, 
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [filterView, setFilterView] = useState<'all' | 'issues' | 'clean'>('all');

  // Helper function to categorize issues with better explanations
  const categorizeIssue = (issue: string) => {
    if (issue.includes('Required field') || issue.includes('missing')) {
      return { type: 'missing', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/10' };
    }
    if (issue.includes('Invalid') || issue.includes('format')) {
      return { type: 'invalid', icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/10' };
    }
    if (issue.includes('Empty record')) {
      return { type: 'empty', icon: Info, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/10' };
    }
    return { type: 'other', icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10' };
  };

  // Sort and filter rows based on quality issues
  const processedRows = useMemo(() => {
    const rowsWithMetadata = currentSheetData.rows.map((row, originalIndex) => {
      const rowIssues = dataQualityIssues.find(issue => issue.rowIndex === originalIndex);
      const hasIssues = !!rowIssues;
      const isError = rowIssues?.severity === 'error';
      const issues = rowIssues?.issues || [];
      
      return {
        row,
        originalIndex,
        hasIssues,
        isError,
        issues,
        categorizedIssues: issues.map(issue => ({
          text: issue,
          ...categorizeIssue(issue)
        }))
      };
    });

    // Filter based on view
    let filteredRows = rowsWithMetadata;
    if (filterView === 'issues') {
      filteredRows = rowsWithMetadata.filter(r => r.hasIssues);
    } else if (filterView === 'clean') {
      filteredRows = rowsWithMetadata.filter(r => !r.hasIssues);
    }

    // Sort: errors first, warnings second, clean records last
    return filteredRows.sort((a, b) => {
      if (a.isError && !b.isError) return -1;
      if (!a.isError && b.isError) return 1;
      if (a.hasIssues && !b.hasIssues) return -1;
      if (!a.hasIssues && b.hasIssues) return 1;
      return a.originalIndex - b.originalIndex;
    });
  }, [currentSheetData.rows, dataQualityIssues, filterView]);

  const totalPages = Math.ceil(processedRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = processedRows.slice(startIndex, endIndex);

  // Reset/clamp pagination when data set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterView, currentSheetData.rows]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);
  const toggleRowExpanded = (originalIndex: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(originalIndex)) {
        newSet.delete(originalIndex);
      } else {
        newSet.add(originalIndex);
      }
      return newSet;
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getIssueTypeCount = (type: string) => {
    return dataQualityIssues.reduce((count, issue) => {
      return count + issue.issues.filter(i => categorizeIssue(i).type === type).length;
    }, 0);
  };

  const errorCount = dataQualityIssues.filter(i => i.severity === 'error').length;
  const warningCount = dataQualityIssues.filter(i => i.severity === 'warning').length;
  const cleanCount = currentSheetData.rows.length - dataQualityIssues.length;

  return (
    <TooltipProvider>
      <div className="flex-1 border rounded-lg p-4 min-h-0 flex flex-col">
        {/* Header with summary and filters */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Data Preview & Quality Analysis ({processedRows.length} rows)
            </h4>
            
            {totalPages > 1 && (
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, processedRows.length)} of {processedRows.length} rows
              </div>
            )}
          </div>

          {/* Quality Summary */}
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">{errorCount}</span>
                <span className="text-muted-foreground">Errors</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-yellow-700">{warningCount}</span>
                <span className="text-muted-foreground">Warnings</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">{cleanCount}</span>
                <span className="text-muted-foreground">Clean</span>
              </div>
            </div>
            
            <div className="ml-auto flex gap-1">
              <Button 
                variant={filterView === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterView('all')}
              >
                All ({currentSheetData.rows.length})
              </Button>
              <Button 
                variant={filterView === 'issues' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterView('issues')}
              >
                Issues ({errorCount + warningCount})
              </Button>
              <Button 
                variant={filterView === 'clean' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterView('clean')}
              >
                Clean ({cleanCount})
              </Button>
            </div>
          </div>

          {/* Issue type breakdown */}
          {dataQualityIssues.length > 0 && (
            <div className="flex gap-2 text-xs">
              {getIssueTypeCount('missing') > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {getIssueTypeCount('missing')} Missing Fields
                </Badge>
              )}
              {getIssueTypeCount('invalid') > 0 && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {getIssueTypeCount('invalid')} Invalid Format
                </Badge>
              )}
              {getIssueTypeCount('empty') > 0 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {getIssueTypeCount('empty')} Empty Records
                </Badge>
              )}
              {getIssueTypeCount('other') > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {getIssueTypeCount('other')} Other Issues
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Data table with horizontal and vertical scroll */}
        <ScrollArea className="flex-1 min-h-0 border rounded-md">
          <div className="min-w-max">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead className="w-12 text-xs bg-background">#</TableHead>
                  <TableHead className="w-20 text-xs bg-background">Quality</TableHead>
                  {currentSheetData.headers.map((header, index) => (
                    <TableHead key={index} className="text-xs min-w-32 bg-background">
                      {header}
                    </TableHead>
                  ))}
                  <TableHead className="w-16 text-xs bg-background">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {currentRows.map(({ row, originalIndex, hasIssues, isError, issues, categorizedIssues }, displayIndex) => (
                <React.Fragment key={`${originalIndex}-${displayIndex}`}>
                  <TableRow 
                    className={
                      hasIssues 
                        ? (isError ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500' : 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500')
                        : 'hover:bg-muted/50'
                    }
                  >
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {originalIndex + 1}
                    </TableCell>
                    
                    <TableCell className="text-xs">
                      {hasIssues ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              {isError ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {issues.length}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-sm">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm">Row Quality Status</div>
                              {isError ? (
                                <div className="text-xs">
                                  <div className="text-red-600 font-medium">❌ Critical Errors Found</div>
                                  <div className="text-muted-foreground mt-1">
                                    This row contains {issues.length} critical error{issues.length > 1 ? 's' : ''} that prevent import. 
                                    The row will be automatically skipped unless these issues are resolved.
                                  </div>
                                  <div className="mt-2 font-medium">Required action:</div>
                                  <div className="text-muted-foreground">Fix all required field issues to proceed with import.</div>
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <div className="text-yellow-600 font-medium">⚠️ Warnings Detected</div>
                                  <div className="text-muted-foreground mt-1">
                                    This row has {issues.length} warning{issues.length > 1 ? 's' : ''} but can still be imported successfully. 
                                    Consider reviewing these issues for better data quality.
                                  </div>
                                  <div className="mt-2 font-medium">Action needed:</div>
                                  <div className="text-muted-foreground">Optional - review warnings to improve data quality.</div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle className="h-4 w-4 text-green-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="text-xs">
                              <div className="text-green-600 font-medium">✅ Ready for Import</div>
                              <div className="text-muted-foreground mt-1">
                                No data quality issues detected. This row can be imported successfully.
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    
                    {row.map((cell, cellIndex) => {
                      // Check if this specific cell has any validation issues
                      const cellHeader = currentSheetData.headers[cellIndex];
                      const cellIssues = categorizedIssues.filter(issue => 
                        issue.text.toLowerCase().includes(cellHeader?.toLowerCase() || '')
                      );
                      
                      return (
                        <TableCell key={cellIndex} className="text-xs whitespace-nowrap">
                          {cellIssues.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`cursor-help rounded px-1 ${cellIssues[0].bgColor} border`}>
                                  {cell?.toString() || <span className="text-muted-foreground italic">empty</span>}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-md">
                                <div className="space-y-2">
                                  <div className="font-semibold text-sm">Data Quality Issue</div>
                                  {cellIssues.map((issue, idx) => (
                                    <div key={idx} className="text-xs">
                                      <div className="font-medium">{issue.text}</div>
                                      <div className="text-muted-foreground mt-1">
                                        {issue.type === 'missing' && (
                                          <>
                                            <strong>Why this matters:</strong> This field is required for importing {currentSheetData.headers[0] || 'records'}. 
                                            Without this information, the entire row will be skipped.
                                            <br /><br />
                                            <strong>How to fix:</strong> Add the missing {cellHeader} value in your source file and re-upload.
                                          </>
                                        )}
                                        {issue.type === 'invalid' && (
                                          <>
                                            <strong>Why this matters:</strong> The current value format may cause import errors or data corruption.
                                            <br /><br />
                                            <strong>How to fix:</strong> Check the expected format for {cellHeader} and correct the value in your source file.
                                          </>
                                        )}
                                        {issue.type === 'empty' && (
                                          <>
                                            <strong>Why this matters:</strong> This entire row appears to have no data in any mapped fields.
                                            <br /><br />
                                            <strong>How to fix:</strong> Either remove this empty row or add the required data.
                                          </>
                                        )}
                                        {issue.type === 'other' && (
                                          <>
                                            <strong>Why this matters:</strong> This issue may affect data quality or import success.
                                            <br /><br />
                                            <strong>How to fix:</strong> Review and correct the data based on the specific issue mentioned above.
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span>{cell?.toString() || <span className="text-muted-foreground italic">empty</span>}</span>
                          )}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-xs">
                      {hasIssues && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRowExpanded(originalIndex)}
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row details */}
                  {hasIssues && expandedRows.has(originalIndex) && (
                    <TableRow>
                      <TableCell colSpan={currentSheetData.headers.length + 3} className="p-0">
                        <div className="px-4 py-3 bg-muted/20 border-l-4 border-l-gray-300">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Data Quality Issues for Row {originalIndex + 1}:
                          </div>
                          <div className="space-y-2">
                            {categorizedIssues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="flex items-start gap-2 text-xs">
                                <issue.icon className={`h-3 w-3 mt-0.5 ${issue.color}`} />
                                <div className="flex-1">
                                  <div className="font-medium">{issue.text}</div>
                                  <div className="text-muted-foreground mt-1">
                                    {issue.type === 'missing' && (
                                      <div>
                                        <strong>Impact:</strong> Missing required data will cause this row to be skipped during import.
                                        <br />
                                        <strong>Solution:</strong> Add the missing information to proceed with import.
                                      </div>
                                    )}
                                    {issue.type === 'invalid' && (
                                      <div>
                                        <strong>Impact:</strong> Invalid format may cause import errors or data corruption.
                                        <br />
                                        <strong>Solution:</strong> Correct the format according to system requirements.
                                      </div>
                                    )}
                                    {issue.type === 'empty' && (
                                      <div>
                                        <strong>Impact:</strong> Empty rows are automatically skipped during import.
                                        <br />
                                        <strong>Solution:</strong> Remove empty rows or add the required data.
                                      </div>
                                    )}
                                    {issue.type === 'other' && (
                                      <div>
                                        <strong>Impact:</strong> May affect data quality or import success.
                                        <br />
                                        <strong>Solution:</strong> Review and address the specific issue mentioned.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                            <div className="mt-3 text-xs">
                              {isError ? (
                                <div className="text-red-600 font-medium bg-red-50 p-2 rounded border-l-4 border-red-500">
                                  🚫 <strong>Critical Error:</strong> This row will be automatically skipped during import. 
                                  All required fields must be filled to proceed with import.
                                </div>
                              ) : (
                                <div className="text-blue-600 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                                  ✅ <strong>Import Ready:</strong> This row can be imported successfully. 
                                  The warnings above are recommendations for better data quality.
                                </div>
                              )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t bg-background">
            {/* Quick navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronsLeft className="h-4 w-4" />
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Page indicator and jump controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
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
                      onClick={() => goToPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Forward navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Forward
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Last
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Original pagination for reference - can be removed */}
        {false && totalPages > 1 && (
          <div className="flex items-center justify-center pt-3 border-t bg-background">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage !== 1) goToPage(1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">First page</span>
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) goToPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
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
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum);
                        }}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) goToPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage !== totalPages) goToPage(totalPages);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  >
                    <ChevronsRight className="h-4 w-4" />
                    <span className="sr-only">Last page</span>
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default DataPreviewTable;