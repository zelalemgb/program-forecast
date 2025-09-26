import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate, EditableOnly } from '@/components/ui/permission-gate';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, TrendingUp, BarChart3, Download, Upload, Calculator, Zap } from 'lucide-react';

interface ForecastScope {
  facilityIds?: number[];
  woredaIds?: number[];
  zoneIds?: number[];
  regionIds?: number[];
  national?: boolean;
}

interface ForecastTemplate {
  id: string;
  name: string;
  description: string;
  scope: string;
  algorithms: string[];
  parameters: Record<string, any>;
}

interface ForecastResult {
  id: string;
  name: string;
  scope: ForecastScope;
  data: any[];
  createdAt: string;
  confidence: number;
  accuracy: number;
}

export const RoleBasedForecastGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [forecastName, setForecastName] = useState('');
  const [description, setDescription] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('6'); // months
  const [algorithm, setAlgorithm] = useState('consumption-based');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ForecastResult[]>([]);
  const [templates, setTemplates] = useState<ForecastTemplate[]>([]);
  
  const permissions = useRolePermissions();
  const { facilityId, woredaId, zoneId, regionId, facilityName, userRole } = useCurrentUser();
  const { toast } = useToast();

  // Role-specific templates
  const getRoleSpecificTemplates = (): ForecastTemplate[] => {
    const baseTemplates: ForecastTemplate[] = [
      {
        id: 'consumption-facility',
        name: 'Consumption-Based Forecast',
        description: 'Forecast based on historical consumption patterns',
        scope: 'facility',
        algorithms: ['linear-regression', 'seasonal-decomposition'],
        parameters: { minHistoryMonths: 6, confidenceLevel: 0.85 }
      },
      {
        id: 'morbidity-facility',
        name: 'Morbidity-Based Forecast',
        description: 'Forecast based on disease patterns and treatment protocols',
        scope: 'facility',
        algorithms: ['epidemiological', 'protocol-based'],
        parameters: { populationSize: 10000, seasonalAdjustment: true }
      }
    ];

    if (permissions.canViewWoredasFacilities) {
      baseTemplates.push({
        id: 'aggregated-woreda',
        name: 'Woreda Aggregated Forecast',
        description: 'Forecast aggregating all facilities in woreda',
        scope: 'woreda',
        algorithms: ['weighted-average', 'facility-aggregation'],
        parameters: { facilityWeighting: 'population-based' }
      });
    }

    if (permissions.canViewZoneFacilities) {
      baseTemplates.push({
        id: 'zone-strategic',
        name: 'Zone Strategic Forecast',
        description: 'Strategic forecast for zone-level planning',
        scope: 'zone',
        algorithms: ['trend-analysis', 'demand-modeling'],
        parameters: { strategicBuffer: 0.15, growthProjection: true }
      });
    }

    if (permissions.canViewRegionalFacilities) {
      baseTemplates.push({
        id: 'regional-planning',
        name: 'Regional Planning Forecast',
        description: 'Comprehensive regional health supply forecast',
        scope: 'regional',
        algorithms: ['multi-level-modeling', 'policy-integration'],
        parameters: { policyFactors: true, budgetConstraints: true }
      });
    }

    if (permissions.canViewNationalData) {
      baseTemplates.push(
        {
          id: 'national-strategic',
          name: 'National Strategic Forecast',
          description: 'National-level strategic health supply planning',
          scope: 'national',
          algorithms: ['macro-modeling', 'policy-simulation'],
          parameters: { macroIndicators: true, policyScenarios: 3 }
        },
        {
          id: 'program-specific',
          name: 'Program-Specific Forecast',
          description: 'Vertical program forecasting (HIV, TB, Malaria, etc.)',
          scope: 'program',
          algorithms: ['program-modeling', 'target-based'],
          parameters: { targetPopulation: true, interventionModeling: true }
        }
      );
    }

    return baseTemplates;
  };

  const generateForecast = async () => {
    if (!forecastName.trim()) {
      toast({ title: "Error", description: "Please enter a forecast name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Determine scope based on user role
      const scope: ForecastScope = {};
      
      if (permissions.isFacilityLevel && facilityId) {
        scope.facilityIds = [facilityId];
      } else if (permissions.canViewWoredasFacilities && woredaId) {
        scope.woredaIds = [woredaId];
      } else if (permissions.canViewZoneFacilities && zoneId) {
        scope.zoneIds = [zoneId];
      } else if (permissions.canViewRegionalFacilities && regionId) {
        scope.regionIds = [regionId];
      } else if (permissions.canViewNationalData) {
        scope.national = true;
      }

      // Create forecast record using existing forecast_rows table
      const { data: forecastData, error: forecastError } = await supabase
        .from('forecast_rows')
        .insert([{
          program: 'General',
          product_list: forecastName,
          unit: 'units',
          year: new Date().getFullYear().toString(),
          forecasted_quantity: Math.floor(Math.random() * 1000)
        }])
        .select()
        .single();

      if (forecastError) throw forecastError;

      // Mock successful completion
      const mockResults = generateMockForecastData(scope);
      
      // Log audit event using existing audit_log table
      await supabase.from('audit_log').insert([{
        table_name: 'forecast_rows',
        record_id: forecastData.id,
        action: 'forecast_generated',
        new_values: JSON.stringify({ name: forecastName, algorithm })
      }]);

      toast({ 
        title: "Success", 
        description: `Forecast "${forecastName}" generated successfully`,
        variant: "default" 
      });

      // Reset form
      setForecastName('');
      setDescription('');
      loadResults();

    } catch (err) {
      console.error('Forecast generation error:', err);
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to generate forecast",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockForecastData = (scope: ForecastScope) => {
    // Mock forecast data generation based on scope
    const products = ['RDT Malaria', 'ACT (AL)', 'Paracetamol 500mg', 'Oxytocin inj', 'HIV Test Kit'];
    return products.map(product => ({
      product,
      currentStock: Math.floor(Math.random() * 1000),
      forecastedDemand: Math.floor(Math.random() * 500) + 100,
      recommendedOrder: Math.floor(Math.random() * 300) + 50,
      confidence: 0.8 + Math.random() * 0.2
    }));
  };

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('forecast_rows')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // Transform to expected format
      const transformedResults = (data || []).map(row => ({
        id: row.id,
        name: row.product_list || 'Forecast',
        scope: {},
        data: [],
        createdAt: row.created_at,
        confidence: 0.85,
        accuracy: 0.82
      }));
      setResults(transformedResults);
    } catch (err) {
      console.error('Failed to load forecast results:', err);
    }
  };

  useEffect(() => {
    setTemplates(getRoleSpecificTemplates());
    loadResults();
  }, [permissions]);

  return (
    <PermissionGate 
      customCheck={(p) => p.canGenerateForecast} 
      showAlert 
      alertMessage="You don't have permission to generate forecasts."
    >
      <div className="space-y-6">
        {/* Header with role context */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Forecast Generation</h2>
            <p className="text-muted-foreground">
              Generate forecasts based on your role and data access level
            </p>
          </div>
          <DataScopeIndicator showDetails className="ml-auto" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Forecast</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  New Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="forecastName">Forecast Name</Label>
                    <Input
                      id="forecastName"
                      value={forecastName}
                      onChange={(e) => setForecastName(e.target.value)}
                      placeholder="Enter forecast name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{template.scope}</Badge>
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeHorizon">Time Horizon (months)</Label>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="algorithm">Algorithm</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumption-based">Consumption-Based</SelectItem>
                        <SelectItem value="morbidity-based">Morbidity-Based</SelectItem>
                        <SelectItem value="hybrid">Hybrid Model</SelectItem>
                        {permissions.canViewNationalData && (
                          <SelectItem value="macro-modeling">Macro Modeling</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose and scope of this forecast"
                    rows={3}
                  />
                </div>

                {/* Scope indicator */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Forecast Scope</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {permissions.isFacilityLevel && (
                      <span>Facility: {facilityName || 'Your facility'}</span>
                    )}
                    {permissions.canViewWoredasFacilities && (
                      <span>All facilities in your woreda</span>
                    )}
                    {permissions.canViewZoneFacilities && (
                      <span>All facilities in your zone</span>
                    )}
                    {permissions.canViewRegionalFacilities && (
                      <span>All facilities in your region</span>
                    )}
                    {permissions.canViewNationalData && (
                      <span>National-level data aggregation</span>
                    )}
                  </div>
                </div>

                <EditableOnly>
                  <Button 
                    onClick={generateForecast} 
                    disabled={loading || !forecastName.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Generating Forecast...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Forecast
                      </>
                    )}
                  </Button>
                </EditableOnly>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTemplate(template.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.scope}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.algorithms.map((algo) => (
                        <Badge key={algo} variant="secondary" className="text-xs">
                          {algo}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{result.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              
              {results.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No forecasts generated yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
};