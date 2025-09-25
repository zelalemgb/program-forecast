import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHistoricalConsumption, PeriodGranularity } from '@/hooks/useHistoricalConsumption';
import { useForecastIntegration } from '@/hooks/useForecastIntegration';
import { TrendingUp, TrendingDown, Minus, BarChart3, Save, Filter, BookOpen, History, Eye, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ForecastSummaryCard } from '@/components/forecast/ForecastSummaryCard';
import { BudgetAdjustmentModal } from '@/components/forecast/BudgetAdjustmentModal';
import { SaveForecastModal } from '@/components/forecast/SaveForecastModal';
import { ForecastSummary, useForecastSummary } from '@/hooks/useForecastSummary';

const ForecastAnalysis: React.FC = () => {
  const [selectedGranularity, setSelectedGranularity] = useState<PeriodGranularity>('monthly');
  const [periodMonths, setPeriodMonths] = useState(12);
  const [forecastDuration, setForecastDuration] = useState(3);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Account type filtering state
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');
  const [availableAccountTypes, setAvailableAccountTypes] = useState<any[]>([]);
  const [accountTypeProducts, setAccountTypeProducts] = useState<string[]>([]);
  
  // Forecast management state
  const [showSavedForecastsModal, setShowSavedForecastsModal] = useState(false);
  const [showSaveForecastModal, setShowSaveForecastModal] = useState(false);
  const [showBudgetAdjustmentModal, setShowBudgetAdjustmentModal] = useState(false);
  const [selectedForecastSummary, setSelectedForecastSummary] = useState<ForecastSummary | null>(null);
  const [savedForecasts, setSavedForecasts] = useState<ForecastSummary[]>([]);
  const [loadedForecastData, setLoadedForecastData] = useState<any[]>([]);
  const [currentLoadedForecast, setCurrentLoadedForecast] = useState<ForecastSummary | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [forecastName, setForecastName] = useState('');
  const [forecastDescription, setForecastDescription] = useState('');

  const { toast } = useToast();
  const facilityId = 1; // This should come from context or user selection
  const [facilityName, setFacilityName] = useState('Current Facility');

  const { data: historicalData, loading: historicalLoading, fetchHistoricalConsumption } = useHistoricalConsumption(facilityId);
  const { generateForecastFromInventory } = useForecastIntegration();
  
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Fetch available account types for filtering
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('account_types')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAvailableAccountTypes(data || []);
      } catch (error) {
        console.error('Error fetching account types:', error);
      }
    };

    fetchAccountTypes();
  }, []);

  // Fetch account type products when account type is selected
  useEffect(() => {
    const fetchAccountTypeProducts = async () => {
      if (!selectedAccountType || selectedAccountType === 'all') {
        setAccountTypeProducts([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('account_type_products')
          .select('product_id')
          .eq('account_type_id', selectedAccountType);
        
        if (error) throw error;
        
        const productIds = data?.map(item => item.product_id) || [];
        setAccountTypeProducts(productIds);
      } catch (error) {
        console.error('Error fetching account type products:', error);
        setAccountTypeProducts([]);
      }
    };

    fetchAccountTypeProducts();
  }, [selectedAccountType]);

  // Initialize forecast summary hook
  const { getForecastSummaries, getForecastSummaryDetails } = useForecastSummary();

  // Load facility name
  useEffect(() => {
    const fetchFacilityName = async () => {
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('name')
          .eq('id', facilityId.toString())
          .single();
        
        if (error) throw error;
        if (data?.name) {
          setFacilityName(data.name);
        }
      } catch (error) {
        console.error('Error fetching facility name:', error);
      }
    };

    fetchFacilityName();
  }, [facilityId]);

  // Fetch saved forecasts
  useEffect(() => {
    const fetchSavedForecasts = async () => {
      try {
        console.log('Loading saved forecasts on page load...');
        const summaries = await getForecastSummaries();
        console.log('Loaded saved forecasts:', summaries);
        setSavedForecasts(summaries);
      } catch (error) {
        console.error('Error fetching saved forecasts:', error);
      }
    };

    fetchSavedForecasts();
  }, []);

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
          const forecast = await generateForecastFromInventory(facilityId, periodMonths, forecastDuration);
          setForecastData(forecast);
        } catch (error) {
          console.error('Error generating forecast:', error);
        } finally {
          setForecastLoading(false);
        }
      }
    };

    generateForecast();
  }, [facilityId, historicalData, periodMonths, forecastDuration, generateForecastFromInventory]);

  // Filter and combine historical and forecast data
  const filteredData = useMemo(() => {
    if (!historicalData?.products) return [];

    let filtered = historicalData.products;

    // Apply account type filter
    if (selectedAccountType && selectedAccountType !== 'all' && accountTypeProducts.length > 0) {
      filtered = filtered.filter(product => 
        accountTypeProducts.includes(product.product_id)
      );
    }

    return filtered;
  }, [historicalData, selectedAccountType, accountTypeProducts]);

  const combinedData = useMemo(() => {
    return filteredData.map(product => {
      const forecast = forecastData.find(f => f.product_id === product.product_id);
      
      // Calculate trend from last two periods
      const periods = product.periods;
      const trend = periods.length >= 2 ? 
        periods[periods.length - 1].consumption - periods[periods.length - 2].consumption : 0;

      return {
        ...product,
        forecast_quantities: forecast ? Array.from({ length: forecastDuration }, (_, i) => 
          forecast[`forecasted_quantity_${i + 1}`] || 0
        ) : Array(forecastDuration).fill(0),
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
    setSelectedProduct(product);
    setIsModalOpen(true);
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
        filter_type: 'account_type',
        filter_criteria: {
          account_type_id: selectedAccountType
        },
        selected_products: [],
        forecast_parameters: {
          granularity: selectedGranularity,
          period_months: periodMonths,
          forecast_duration: forecastDuration
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
      
      // This old code is not compatible with new forecast summary structure
      // setSavedForecasts(data || []);
      
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
      setSelectedAccountType(savedForecast.filter_criteria?.account_type_id || 'all');
      setSelectedGranularity(savedForecast.forecast_parameters?.granularity || 'monthly');
      setPeriodMonths(savedForecast.forecast_parameters?.period_months || 12);
      setForecastDuration(savedForecast.forecast_parameters?.forecast_duration || 3);

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
        <Label className="text-xs">Account Type</Label>
        <Select 
          value={selectedAccountType} 
          onValueChange={setSelectedAccountType}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select account type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {availableAccountTypes.map(accountType => (
              <SelectItem key={accountType.id} value={accountType.id}>
                {accountType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <Label className="text-xs">Forecast Duration ({selectedGranularity})</Label>
        <Select 
          value={forecastDuration.toString()} 
          onValueChange={(value) => setForecastDuration(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Period</SelectItem>
            <SelectItem value="2">2 Periods</SelectItem>
            <SelectItem value="3">3 Periods</SelectItem>
            <SelectItem value="4">4 Periods</SelectItem>
            <SelectItem value="5">5 Periods</SelectItem>
            <SelectItem value="6">6 Periods</SelectItem>
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
                    placeholder="Optional description"
                  />
                </div>
                <Button onClick={handleSaveForecast} disabled={!forecastName.trim()}>
                  Save Forecast
                </Button>
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
    </div>
  );

  return (
    <PageLayout 
      title={currentLoadedForecast ? `Forecast Analysis - ${facilityName} - ${currentLoadedForecast.name}` : `Forecast Analysis - ${facilityName}`} 
      actions={titleActions}
    >
      <div className="space-y-6">
        {/* Current Forecast Status */}
        {currentLoadedForecast && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Currently Viewing: {currentLoadedForecast.name}</h3>
                  <p className="text-sm text-blue-700">
                    {currentLoadedForecast.description} • {currentLoadedForecast.total_line_items} items • 
                    Created {format(new Date(currentLoadedForecast.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-900">
                    {currentLoadedForecast.current_total_value.toLocaleString()}
                  </div>
                  {currentLoadedForecast.available_budget && (
                    <div className="text-sm text-blue-700">
                      Budget: {currentLoadedForecast.available_budget.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Consumption Analysis & Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicalLoading || forecastLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : combinedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedAccountType && selectedAccountType !== 'all' ? 'No products found for the selected account type.' : 'No consumption data available for the selected period.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Total Consumption</TableHead>
                    <TableHead>Avg Monthly</TableHead>
                    {Array.from({ length: forecastDuration }, (_, i) => (
                      <TableHead key={i}>Forecast P{i + 1}</TableHead>
                    ))}
                    <TableHead>Trend</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedData.map((product) => (
                    <TableRow 
                      key={product.product_id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(product)}
                    >
                      <TableCell className="font-medium">
                        {product.product_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.program || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(product.total_consumption)}</TableCell>
                      <TableCell>{formatNumber(product.average_consumption)}</TableCell>
                      {product.forecast_quantities.map((quantity: number, i: number) => (
                        <TableCell key={i}>{formatNumber(quantity)}</TableCell>
                      ))}
                      <TableCell>{getTrendIcon(product.trend)}</TableCell>
                      <TableCell>{getConfidenceBadge(product.confidence)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Saved Forecasts Section */}
        {!currentLoadedForecast && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Saved Forecasts ({savedForecasts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedForecasts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedForecasts.slice(0, 6).map((summary) => (
                  <div 
                    key={summary.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadSavedForecast(summary)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{summary.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {summary.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {summary.description || 'No description'}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{summary.total_line_items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span className="font-medium">{summary.current_total_value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{format(new Date(summary.created_at), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                  {savedForecasts.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowSavedForecastsModal(true)}
                      >
                        View All {savedForecasts.length} Forecasts
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No saved forecasts yet</p>
                  <p className="text-sm">Generate and save a forecast to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct?.product_name} - Detailed Analysis</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Consumption</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(selectedProduct.total_consumption)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Monthly Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(selectedProduct.average_consumption)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Forecast Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{(selectedProduct.confidence * 100).toFixed(0)}%</div>
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
                      <div className="flex items-center gap-2">
                        {getTrendIcon(selectedProduct.trend)}
                        <span className="font-medium">
                          {getTrendAnalysis(selectedProduct).direction.charAt(0).toUpperCase() + 
                           getTrendAnalysis(selectedProduct).direction.slice(1)} Trend
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTrendAnalysis(selectedProduct).description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Consumption Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Consumption & Forecast Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData(selectedProduct)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Save Forecast Modal */}
        <SaveForecastModal
          open={showSaveForecastModal}
          onOpenChange={setShowSaveForecastModal}
          forecastData={combinedData}
          facilityName={facilityName}
          accountType={selectedAccountType}
          forecastDuration={forecastDuration}
          onSaved={async () => {
            const summaries = await getForecastSummaries();
            setSavedForecasts(summaries);
          }}
        />

        {/* Budget Adjustment Modal */}
        <BudgetAdjustmentModal
          open={showBudgetAdjustmentModal}
          onOpenChange={setShowBudgetAdjustmentModal}
          summary={selectedForecastSummary}
          onSaved={async () => {
            const summaries = await getForecastSummaries();
            setSavedForecasts(summaries);
            // Reload current forecast if it was adjusted
            if (currentLoadedForecast) {
              await loadSavedForecast(currentLoadedForecast);
            }
            setSelectedForecastSummary(null);
          }}
        />

        {/* Saved Forecasts Modal */}
        <Dialog open={showSavedForecastsModal} onOpenChange={setShowSavedForecastsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Saved Forecast Summaries</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForecasts.map((summary) => (
                <ForecastSummaryCard
                  key={summary.id}
                  summary={summary}
                  onView={(summary) => {
                    loadSavedForecast(summary);
                    setShowSavedForecastsModal(false);
                  }}
                  onAdjust={(summary) => {
                    loadSavedForecast(summary);
                    setSelectedForecastSummary(summary);
                    setShowSavedForecastsModal(false);
                    setShowBudgetAdjustmentModal(true);
                  }}
                />
              ))}
            </div>
            {savedForecasts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No saved forecasts found. Generate and save a forecast to see it here.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ForecastAnalysis;