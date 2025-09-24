import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpen, Eye, Trash2, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const SavedForecasts: React.FC = () => {
  const [savedForecasts, setSavedForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const facilityId = 1; // This should come from context or user selection

  useEffect(() => {
    fetchSavedForecasts();
  }, []);

  const fetchSavedForecasts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_forecasts')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedForecasts(data || []);
    } catch (error) {
      console.error('Error fetching saved forecasts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved forecasts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteForecast = async (forecastId: string) => {
    try {
      const { error } = await supabase
        .from('saved_forecasts')
        .delete()
        .eq('id', forecastId);

      if (error) throw error;

      setSavedForecasts(prev => prev.filter(f => f.id !== forecastId));
      toast({
        title: "Forecast Deleted",
        description: "Saved forecast has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete forecast",
        variant: "destructive",
      });
    }
  };

  const loadForecastInAnalysis = (forecast: any) => {
    // Navigate to forecast analysis with the saved configuration
    const params = new URLSearchParams({
      loadForecast: forecast.id
    });
    navigate(`/forecast-analysis?${params.toString()}`);
  };

  const getFilterBadge = (forecast: any) => {
    const { filter_type, filter_criteria, selected_products } = forecast;
    
    switch (filter_type) {
      case 'all':
        return <Badge variant="secondary">All Products</Badge>;
      case 'program':
        return <Badge variant="default">Program: {filter_criteria?.program}</Badge>;
      case 'ven_classification':
        return <Badge variant="outline">VEN: {filter_criteria?.ven_classification}</Badge>;
      case 'custom':
        return <Badge variant="destructive">{selected_products?.length || 0} Selected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <PageLayout
        title="Saved Forecasts"
        description="Manage your saved forecast configurations"
      >
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Saved Forecasts"
      description="Manage your saved forecast configurations"
      actions={
        <Button onClick={() => navigate('/forecast-analysis')}>
          <BookOpen className="h-4 w-4 mr-2" />
          New Forecast
        </Button>
      }
    >
      <div className="space-y-6">
        {savedForecasts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Saved Forecasts</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Create and save custom forecast configurations to quickly access them later.
              </p>
              <Button onClick={() => navigate('/forecast-analysis')}>
                Create Your First Forecast
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Saved Forecast Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Filter</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedForecasts.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{forecast.name}</div>
                          {forecast.description && (
                            <div className="text-sm text-muted-foreground">
                              {forecast.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getFilterBadge(forecast)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{forecast.forecast_parameters?.granularity || 'monthly'}</div>
                          <div className="text-muted-foreground">
                            {forecast.forecast_parameters?.period_months || 12} months
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(forecast.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedForecast(forecast)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{selectedForecast?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedForecast?.description && (
                                  <div>
                                    <h4 className="font-medium mb-1">Description</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedForecast.description}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium mb-2">Configuration</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Filter Type:</span>
                                      <span>{selectedForecast?.filter_type}</span>
                                    </div>
                                    {selectedForecast?.filter_criteria?.program && (
                                      <div className="flex justify-between">
                                        <span>Program:</span>
                                        <span>{selectedForecast.filter_criteria.program}</span>
                                      </div>
                                    )}
                                    {selectedForecast?.filter_criteria?.ven_classification && (
                                      <div className="flex justify-between">
                                        <span>VEN Class:</span>
                                        <span>{selectedForecast.filter_criteria.ven_classification}</span>
                                      </div>
                                    )}
                                    {selectedForecast?.selected_products?.length > 0 && (
                                      <div className="flex justify-between">
                                        <span>Selected Products:</span>
                                        <span>{selectedForecast.selected_products.length}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>Period:</span>
                                      <span>{selectedForecast?.forecast_parameters?.granularity || 'monthly'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Duration:</span>
                                      <span>{selectedForecast?.forecast_parameters?.period_months || 12} months</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => loadForecastInAnalysis(forecast)}
                          >
                            <Filter className="h-4 w-4 mr-1" />
                            Load
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Forecast</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{forecast.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteForecast(forecast.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default SavedForecasts;