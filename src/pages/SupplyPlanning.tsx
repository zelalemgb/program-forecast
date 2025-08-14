import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, HelpCircle, Clock, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import * as ethiopianDate from "ethiopian-date";

const SupplyPlanning: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  
  const [periodType, setPeriodType] = useState<string>("monthly");
  const [startingPeriod, setStartingPeriod] = useState<string>("hamle-2016");

  // Generate periods based on selection
  const generatePeriods = () => {
    // Since the ethiopian-date library is for conversion only, 
    // we'll use predefined Ethiopian month names
    if (periodType === "monthly") {
      // 12 months starting from Hamle (Ethiopian calendar)
      const hamleMonths = ["Hamle", "Nehase", "Meskerem", "Tekemet", "Hedar", "Tahsas", 
                          "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene"];
      return hamleMonths;
    } else if (periodType === "quarterly") {
      // 4 quarters
      return ["Q1 (Hamle-Meskerem)", "Q2 (Tekemet-Tahsas)", "Q3 (Tir-Miazia)", "Q4 (Ginbot-Sene)"];
    } else if (periodType === "biannually") {
      // 2 halves
      return ["H1 (Hamle-Tahsas)", "H2 (Tir-Sene)"];
    }
    return [];
  };

  const periods = generatePeriods();

  // Initialize all periods as collapsed by default
  const [collapsedPeriods, setCollapsedPeriods] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    periods.forEach((_, index) => {
      initialState[index] = true; // Start collapsed
    });
    return initialState;
  });

  // State for manual entry - only for drugs without inventory data
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});
  
  // Define which drugs have existing inventory data
  const drugsWithInventory = ["Artemether", "Amoxicillin"]; // Drugs with existing data
  const drugsWithoutInventory = ["Paracetamol", "ORS", "Iron Tablets"]; // Drugs needing manual entry

  const handleValueChange = (drugName: string, periodIndex: number, value: string) => {
    const key = `${drugName}-${periodIndex}`;
    setEditableValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEditableValue = (drugName: string, periodIndex: number) => {
    const key = `${drugName}-${periodIndex}`;
    return editableValues[key] || "";
  };

  const togglePeriod = (index: number) => {
    setCollapsedPeriods(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Supply Planning Analysis | Forlab+</title>
        <meta
          name="description"
          content="Supply planning analysis for facility inventory management and annual drug consumption forecasting."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Supply Planning Analysis
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Facility: Main Health Center</span>
            <span>•</span>
            <span>Analysis Period: Feb 2024</span>
            <span>•</span>
            <span>Last Updated: 15 Feb 2024</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Current Period Analysis
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Forecast Active
          </Badge>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supply Planning Analysis
            </CardTitle>
            <CardDescription>
              Annual drug consumption analysis based on Ethiopian calendar year starting from Hamle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="period-type" className="font-medium">Period Type:</Label>
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="biannually">Biannually</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="starting-period" className="font-medium">Starting Period:</Label>
              <Select value={startingPeriod} onValueChange={setStartingPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hamle-2016">Hamle 2016 E.C.</SelectItem>
                  <SelectItem value="hamle-2015">Hamle 2015 E.C.</SelectItem>
                  <SelectItem value="hamle-2014">Hamle 2014 E.C.</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-2">
                One Year Analysis ({periods.length} {periodType === "monthly" ? "months" : periodType === "quarterly" ? "quarters" : "periods"})
              </Badge>
            </div>

            {/* Drug-by-Drug Table */}
            <div className="space-y-4">
              <h4 className="font-medium">Drug-by-Drug Annual Analysis ({periodType} periods)</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-20 border-r min-w-[200px]">Drug Name</TableHead>
                        {periods.map((period, index) => (
                          <TableHead key={index} className="text-center border-l relative" colSpan={collapsedPeriods[index] ? 1 : 9}>
                            <Collapsible>
                              <CollapsibleTrigger
                                className="flex items-center gap-1 hover:bg-muted/50 p-1 rounded"
                                onClick={() => togglePeriod(index)}
                              >
                                {collapsedPeriods[index] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {period}
                              </CollapsibleTrigger>
                            </Collapsible>
                          </TableHead>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-20 border-r"></TableHead>
                        {periods.map((_, periodIndex) => (
                          <React.Fragment key={periodIndex}>
                            {!collapsedPeriods[periodIndex] ? (
                              <>
                                <TableHead className="text-right text-xs">Beg.</TableHead>
                                <TableHead className="text-right text-xs">Rec.</TableHead>
                                <TableHead className="text-right text-xs">Iss.</TableHead>
                                <TableHead className="text-right text-xs">Adj.</TableHead>
                                <TableHead className="text-right text-xs">End.</TableHead>
                                <TableHead className="text-right text-xs">AMC</TableHead>
                                <TableHead className="text-right text-xs">MOS</TableHead>
                                <TableHead className="text-right text-xs">Max</TableHead>
                                <TableHead className="text-right text-xs">Min</TableHead>
                              </>
                            ) : (
                              <TableHead className="text-right text-xs">Summary</TableHead>
                            )}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Historical Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={100} className="font-medium text-sm py-2">
                          📊 Historical Period (Actual Data)
                        </TableCell>
                      </TableRow>
                      
                      {/* Drugs with inventory data */}
                      {drugsWithInventory.map((drug, drugIndex) => (
                        <TableRow key={drug}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r font-medium">
                            {drug}
                          </TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right">{drugIndex === 0 ? "1,200" : "850"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "2,000" : "1,500"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "1,800" : "1,200"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "0" : "-50"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "1,400" : "1,100"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "180" : "120"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "7.8" : "9.2"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "360" : "240"}</TableCell>
                                  <TableCell className="text-right">{drugIndex === 0 ? "90" : "60"}</TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right font-medium">{drugIndex === 0 ? "1,400" : "1,100"}</TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                      ))}

                      {/* Forecast Section */}
                      <TableRow className="bg-blue-50/50 dark:bg-blue-950/20">
                        <TableCell colSpan={100} className="font-medium text-sm py-2">
                          🔮 Forecast Period (Predicted Values)
                        </TableCell>
                      </TableRow>
                      
                      {/* Forecast rows with same drugs */}
                      {drugsWithInventory.map((drug, drugIndex) => (
                        <TableRow key={`forecast-${drug}`} className="bg-blue-50/30 dark:bg-blue-950/10">
                          <TableCell className="sticky left-0 bg-blue-50/30 dark:bg-blue-950/10 z-10 border-r font-medium">
                            {drug} <Badge variant="outline" className="ml-2 text-xs">Forecast</Badge>
                          </TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "1,400" : "1,100"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "2,100" : "1,600"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "1,850" : "1,250"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">0</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "1,650" : "1,450"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "185" : "125"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "8.9" : "11.6"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "370" : "250"}</TableCell>
                                  <TableCell className="text-right text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "93" : "63"}</TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right font-medium text-blue-700 dark:text-blue-300">{drugIndex === 0 ? "1,650" : "1,450"}</TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Forecast Methodology</h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Forecasts are generated using historical consumption patterns, seasonal adjustments, and 
                facility growth projections. Values shown are predictions based on the last 12 months of data.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Supply Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SupplyPlanning;