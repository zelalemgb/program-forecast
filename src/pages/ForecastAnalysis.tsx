import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHistoricalConsumption, PeriodGranularity } from '@/hooks/useHistoricalConsumption';
import { useForecastIntegration } from '@/hooks/useForecastIntegration';
import { TrendingUp, TrendingDown, Minus, BarChart3, Save, Filter, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ForecastAnalysis: React.FC = () => {
  const [selectedGranularity, setSelectedGranularity] = useState<PeriodGranularity>('monthly');
  const [periodMonths, setPeriodMonths] = useState(12);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New filtering and saving state
  const [filterType, setFilterType] = useState<'all' | 'program' | 'ven_classification' | 'custom'>('all');
  const [programFilter, setProgramFilter] = useState<string>('');
  const [venFilter, setVenFilter] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [forecastName, setForecastName] = useState('');
  const [forecastDescription, setForecastDescription] = useState('');
  const [savedForecasts, setSavedForecasts] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  
  const { toast } = useToast();
  const facilityId = 1; // This should come from context or user selection

  const { data: historicalData, loading: historicalLoading, fetchHistoricalConsumption } = useHistoricalConsumption(facilityId);
  const { generateForecastFromInventory } = useForecastIntegration();
  
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Fetch available programs for filtering
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('product_reference')
          .select('program')
          .not('program', 'is', null)
          .eq('active', true);
        
        if (error) throw error;
        
        const uniquePrograms = [...new Set(data?.map(p => p.program).filter(Boolean))];
        setAvailablePrograms(uniquePrograms);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch saved forecasts
  useEffect(() => {
    const fetchSavedForecasts = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_forecasts')
          .select('*')
          .eq('facility_id', facilityId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSavedForecasts(data || []);
      } catch (error) {
        console.error('Error fetching saved forecasts:', error);
      }
    };

    fetchSavedForecasts();
  }, [facilityId]);

  // Fetch historical data when parameters change
  useEffect(() => {
    if (facilityId) {
      fetchHistoricalConsumption(periodMonths, selectedGranularity);
    }
  }, [facilityId, periodMonths, selectedGranularity, fetchHistoricalConsumption]);

  // Generate forecast data
  useEffect(() => {
    const generateForecast = async () => {
      if (facilityId && historicalData?.products?.length > 0) {
        setForecastLoading(true);
        try {
          const forecast = await generateForecastFromInventory(facilityId, periodMonths, 3);
          setForecastData(forecast);
        } catch (error) {
          console.error('Error generating forecast:', error);
        } finally {
          setForecastLoading(false);
        }
      }
    };

    generateForecast();
  }, [facilityId, historicalData, periodMonths, generateForecastFromInventory]);

  // Filter and combine historical and forecast data
  const filteredData = useMemo(() => {
    if (!historicalData?.products) return [];

    let filtered = historicalData.products;

    // Apply filters based on type
    switch (filterType) {
      case 'program':
        if (programFilter) {
          filtered = filtered.filter(product => 
            product.program === programFilter
          );
        }
        break;
      case 'ven_classification':
        if (venFilter) {
          filtered = filtered.filter(product => 
            product.ven_classification === venFilter
          );
        }
        break;
      case 'custom':
        if (selectedProducts.size > 0) {
          filtered = filtered.filter(product => 
            selectedProducts.has(product.product_id)
          );
        }
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }, [historicalData, filterType, programFilter, venFilter, selectedProducts]);

  const combinedData = useMemo(() => {
    return filteredData.map(product => {
      const forecast = forecastData.find(f => f.product_id === product.product_id);
      
      // Calculate trend from last two periods
      const periods = product.periods;
      const trend = periods.length >= 2 ? 
        periods[periods.length - 1].consumption - periods[periods.length - 2].consumption : 0;

      return {
        ...product,
        forecast_quantities: forecast ? [
          forecast.forecasted_quantity_1,
          forecast.forecasted_quantity_2, 
          forecast.forecasted_quantity_3
        ] : [0, 0, 0],
        trend,
        confidence: forecast?.confidence_score || 0
      };
    });
  }, [filteredData, forecastData]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge variant="outline" className="bg-red-100 text-red-800">Low</Badge>;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const handleRowClick = (product: any) => {
    if (isSelectMode) {
      const newSelected = new Set(selectedProducts);
      if (newSelected.has(product.product_id)) {
        newSelected.delete(product.product_id);
      } else {
        newSelected.add(product.product_id);
      }
      setSelectedProducts(newSelected);
    } else {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === combinedData.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(combinedData.map(p => p.product_id)));
    }
  };

  const handleSaveForecast = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save forecasts",
          variant: "destructive",
        });
        return;
      }

      const forecastConfig = {
        facility_id: facilityId,
        user_id: user.id,
        name: forecastName,
        description: forecastDescription,
        filter_type: filterType,
        filter_criteria: {
          program: programFilter,
          ven_classification: venFilter
        },
        selected_products: filterType === 'custom' ? Array.from(selectedProducts) : [],
        forecast_parameters: {
          granularity: selectedGranularity,
          period_months: periodMonths
        }
      };

      const { error } = await supabase
        .from('saved_forecasts')
        .insert(forecastConfig);

      if (error) throw error;

      toast({
        title: "Forecast Saved",
        description: `"${forecastName}" has been saved successfully`,
      });

      // Reset form and close dialog
      setForecastName('');
      setForecastDescription('');
      setIsSaveDialogOpen(false);
      
      // Refresh saved forecasts list
      const { data } = await supabase
        .from('saved_forecasts')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });
      
      setSavedForecasts(data || []);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save forecast",
        variant: "destructive",
      });
    }
  };

  const loadSavedForecast = async (savedForecast: any) => {
    try {
      setFilterType(savedForecast.filter_type);
      setProgramFilter(savedForecast.filter_criteria?.program || '');
      setVenFilter(savedForecast.filter_criteria?.ven_classification || '');
      setSelectedProducts(new Set(savedForecast.selected_products || []));
      setSelectedGranularity(savedForecast.forecast_parameters?.granularity || 'monthly');
      setPeriodMonths(savedForecast.forecast_parameters?.period_months || 12);

      toast({
        title: "Forecast Loaded",
        description: `"${savedForecast.name}" configuration loaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load forecast configuration",
        variant: "destructive",
      });
    }
  };

  const getChartData = (product: any) => {
    if (!product) return [];
    
    const historicalData = product.periods.map((period: any, index: number) => ({
      name: period.period_label,
      consumption: period.consumption,
      type: 'Historical',
      period: index + 1
    }));

    const forecastData = product.forecast_quantities.map((quantity: number, index: number) => ({
      name: `Forecast ${index + 1}`,
      consumption: quantity,
      type: 'Forecast',
      period: product.periods.length + index + 1
    }));

    return [...historicalData, ...forecastData];
  };

  const getTrendAnalysis = (product: any) => {
    if (!product || product.periods.length < 2) return { direction: 'stable', change: 0, description: 'Insufficient data' };
    
    const recent = product.periods.slice(-3);
    const older = product.periods.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum: number, p: any) => sum + p.consumption, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum: number, p: any) => sum + p.consumption, 0) / older.length : recentAvg;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let direction = 'stable';
    let description = '';
    
    if (change > 10) {
      direction = 'increasing';
      description = `Consumption has increased by ${change.toFixed(1)}% in recent periods`;
    } else if (change < -10) {
      direction = 'decreasing';
      description = `Consumption has decreased by ${Math.abs(change).toFixed(1)}% in recent periods`;
    } else {
      description = 'Consumption has remained relatively stable';
    }
    
    return { direction, change, description };
  };

  const titleActions = (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Filter Type</Label>
        <Select 
          value={filterType} 
          onValueChange={(value: 'all' | 'program' | 'ven_classification' | 'custom') => {
            setFilterType(value);
            if (value !== 'custom') {
              setSelectedProducts(new Set());
              setIsSelectMode(false);
            }
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="program">By Program</SelectItem>
            <SelectItem value="ven_classification">By VEN Class</SelectItem>
            <SelectItem value="custom">Custom Selection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filterType === 'program' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Program</Label>
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Programs</SelectItem>
              {availablePrograms.map(program => (
                <SelectItem key={program} value={program}>{program}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filterType === 'ven_classification' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">VEN Class</Label>
          <Select value={venFilter} onValueChange={setVenFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              <SelectItem value="Vital">Vital</SelectItem>
              <SelectItem value="Essential">Essential</SelectItem>
              <SelectItem value="Nonessential">Nonessential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filterType === 'custom' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Selection Mode</Label>
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSelectMode(!isSelectMode)}
            className="w-32"
          >
            {isSelectMode ? 'Exit Select' : 'Select Products'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Period</Label>
        <Select 
          value={selectedGranularity} 
          onValueChange={(value: PeriodGranularity) => setSelectedGranularity(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Duration</Label>
        <Select 
          value={periodMonths.toString()} 
          onValueChange={(value) => setPeriodMonths(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="18">18 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
            <SelectItem value="36">36 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Actions</Label>
        <div className="flex gap-2">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Forecast Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Forecast Name</Label>
                  <Input
                    value={forecastName}
                    onChange={(e) => setForecastName(e.target.value)}
                    placeholder="Enter forecast name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={forecastDescription}
                    onChange={(e) => setForecastDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Filter:</strong> {filterType}</p>
                  {filterType === 'program' && programFilter && <p><strong>Program:</strong> {programFilter}</p>}
                  {filterType === 'ven_classification' && venFilter && <p><strong>VEN Class:</strong> {venFilter}</p>}
                  {filterType === 'custom' && <p><strong>Selected Products:</strong> {selectedProducts.size}</p>}
                  <p><strong>Period:</strong> {selectedGranularity}, {periodMonths} months</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveForecast} disabled={!forecastName.trim()}>
                    Save Forecast
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {savedForecasts.length > 0 && (
            <Select onValueChange={(value) => {
              const forecast = savedForecasts.find(f => f.id === value);
              if (forecast) loadSavedForecast(forecast);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Load..." />
              </SelectTrigger>
              <SelectContent>
                {savedForecasts.map(forecast => (
                  <SelectItem key={forecast.id} value={forecast.id}>
                    {forecast.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
        <div>{combinedData.length} products</div>
        <div>{historicalData?.period_headers?.length || 0} periods</div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Forecast Analysis"
      description="Analyze historical consumption patterns and future demand forecasts"
      actions={titleActions}
    >
      <div className="space-y-6">
        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Pattern & Forecast Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {historicalLoading || forecastLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isSelectMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedProducts.size === combinedData.length && combinedData.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                      )}
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">VEN Class</TableHead>
                      <TableHead className="text-center">Avg Consumption</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      {historicalData?.period_headers?.map((header, index) => (
                        <TableHead key={`hist-${index}`} className="text-center min-w-[100px]">
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-blue-50 min-w-[100px]">Forecast P1</TableHead>
                      <TableHead className="text-center bg-blue-50 min-w-[100px]">Forecast P2</TableHead>
                      <TableHead className="text-center bg-blue-50 min-w-[100px]">Forecast P3</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={(isSelectMode ? 10 : 9) + (historicalData?.period_headers?.length || 0)} className="text-center py-8 text-muted-foreground">
                          {filterType !== 'all' ? 'No products match the selected filters' : 'No consumption data available for the selected period'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      combinedData.map((product) => (
                        <TableRow 
                          key={product.product_id} 
                          className={`cursor-pointer transition-colors ${
                            isSelectMode 
                              ? selectedProducts.has(product.product_id) 
                                ? 'bg-blue-50 hover:bg-blue-100' 
                                : 'hover:bg-muted/50'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleRowClick(product)}
                        >
                          {isSelectMode && (
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.has(product.product_id)}
                                onChange={() => {}} // Handled by row click
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            {product.product_name}
                          </TableCell>
                          <TableCell className="text-center">{product.unit}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                product.ven_classification === 'Vital' ? 'destructive' :
                                product.ven_classification === 'Essential' ? 'default' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {product.ven_classification || 'Essential'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatNumber(product.average_consumption)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              {getTrendIcon(product.trend)}
                            </div>
                          </TableCell>
                          {product.periods.map((period, index) => (
                            <TableCell key={`period-${index}`} className="text-center">
                              {formatNumber(period.consumption)}
                            </TableCell>
                          ))}
                          {product.forecast_quantities.map((forecast, index) => (
                            <TableCell key={`forecast-${index}`} className="text-center bg-blue-50">
                              <span className="font-medium text-blue-700">
                                {formatNumber(forecast)}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            {getConfidenceBadge(product.confidence)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {selectedProduct?.product_name} - Consumption Analysis
              </DialogTitle>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(selectedProduct.total_consumption)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Consumption</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(selectedProduct.average_consumption)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average per Period</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-green-600">
                        {selectedProduct.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">Unit</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Badge 
                        variant={
                          selectedProduct.ven_classification === 'Vital' ? 'destructive' :
                          selectedProduct.ven_classification === 'Essential' ? 'default' : 
                          'secondary'
                        }
                        className="text-sm font-bold px-3 py-1"
                      >
                        {selectedProduct.ven_classification || 'Essential'}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">VEN Classification</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        {getTrendIcon(selectedProduct.trend)}
                        {Math.abs(selectedProduct.trend).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Recent Trend</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {getConfidenceBadge(selectedProduct.confidence)}
                      </div>
                      <div className="text-sm text-muted-foreground">Forecast Confidence</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {getTrendAnalysis(selectedProduct).description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Unit: <strong>{selectedProduct.unit}</strong></span>
                        <span>Data Points: <strong>{selectedProduct.periods.length}</strong></span>
                        <span>Forecast Periods: <strong>3</strong></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Consumption Trend & Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData(selectedProduct)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: string) => [
                              `${formatNumber(value)} ${selectedProduct.unit}`,
                              name === 'consumption' ? 'Consumption' : name
                            ]}
                            labelFormatter={(label) => `Period: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Historical & Forecast Data</span>
                      </div>
                      <div>Last {selectedProduct.periods.length} periods + 3 forecast periods</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ForecastAnalysis;