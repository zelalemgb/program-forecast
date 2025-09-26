import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search, Plus, Filter } from 'lucide-react';

interface ForecastSetupProps {
  // Filters
  productType: string;
  accountType: string;
  program: string;
  onProductTypeChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  
  // Period settings
  periodType: string;
  startingPeriod: string;
  onPeriodTypeChange: (value: string) => void;
  onStartingPeriodChange: (value: string) => void;
  periods: string[];
  
  // Drug search
  selectedDrugs: string[];
  onAddDrug: (drug: string) => void;
  onRemoveDrug: (drug: string) => void;
  onClearFilters: () => void;
}

export const ForecastSetup: React.FC<ForecastSetupProps> = ({
  productType,
  accountType,
  program,
  onProductTypeChange,
  onAccountTypeChange,
  onProgramChange,
  periodType,
  startingPeriod,
  onPeriodTypeChange,
  onStartingPeriodChange,
  periods,
  selectedDrugs,
  onAddDrug,
  onRemoveDrug,
  onClearFilters
}) => {
  const [drugSearch, setDrugSearch] = useState('');
  
  // Mock drug suggestions - in real app, this would come from your database
  const drugSuggestions = [
    'Amoxicillin 250mg',
    'Paracetamol 500mg',
    'ORS Sachets',
    'Cotrimoxazole 480mg',
    'Iron + Folic Acid',
    'Artesunate 60mg',
    'Oral Contraceptive Pills',
    'Vitamin A Capsules',
    'Measles Vaccine',
    'Tetanus Toxoid'
  ];

  const filteredSuggestions = drugSuggestions.filter(drug => 
    drug.toLowerCase().includes(drugSearch.toLowerCase()) && 
    !selectedDrugs.includes(drug)
  );

  const handleAddDrug = (drug: string) => {
    onAddDrug(drug);
    setDrugSearch('');
  };

  const hasFilters = productType !== 'all' || accountType !== 'all' || program !== 'all' || selectedDrugs.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Forecast Setup</h3>
          {hasFilters && (
            <Badge variant="secondary" className="text-xs">
              {[productType !== 'all', accountType !== 'all', program !== 'all', selectedDrugs.length > 0].filter(Boolean).length} filters active
            </Badge>
          )}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - What to forecast */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">1</span>
                What do you want to forecast?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Product Type</Label>
                <Select value={productType} onValueChange={onProductTypeChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="medicines">Medicines</SelectItem>
                    <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="vaccines">Vaccines</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Or search specific drugs</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for specific drugs..."
                      value={drugSearch}
                      onChange={(e) => setDrugSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {drugSearch && filteredSuggestions.length > 0 && (
                    <div className="border rounded-md bg-background shadow-lg z-50 max-h-32 overflow-y-auto">
                      {filteredSuggestions.slice(0, 5).map((drug) => (
                        <button
                          key={drug}
                          onClick={() => handleAddDrug(drug)}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          {drug}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedDrugs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedDrugs.map((drug) => (
                        <Badge key={drug} variant="default" className="text-xs flex items-center gap-1">
                          {drug}
                          <button
                            onClick={() => onRemoveDrug(drug)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">2</span>
                For which context?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Account Type</Label>
                <Select value={accountType} onValueChange={onAccountTypeChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All Account Types</SelectItem>
                    <SelectItem value="public">Public Health Facilities</SelectItem>
                    <SelectItem value="private">Private Facilities</SelectItem>
                    <SelectItem value="ngo">NGO Facilities</SelectItem>
                    <SelectItem value="faith_based">Faith-based Facilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Health Program</Label>
                <Select value={program} onValueChange={onProgramChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select health program" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="maternal_health">Maternal Health</SelectItem>
                    <SelectItem value="child_health">Child Health</SelectItem>
                    <SelectItem value="reproductive_health">Reproductive Health</SelectItem>
                    <SelectItem value="malaria">Malaria Control</SelectItem>
                    <SelectItem value="tuberculosis">Tuberculosis</SelectItem>
                    <SelectItem value="hiv_aids">HIV/AIDS</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="immunization">Immunization</SelectItem>
                    <SelectItem value="emergency">Emergency Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - When and how */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">3</span>
                Starting when and for how long?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Starting Period</Label>
                <Select value={startingPeriod} onValueChange={onStartingPeriodChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select starting period" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="hamle-2017">Hamle 2017 EC</SelectItem>
                    <SelectItem value="hamle-2018">Hamle 2018 EC</SelectItem>
                    <SelectItem value="hamle-2019">Hamle 2019 EC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Period Type</Label>
                <Select value={periodType} onValueChange={onPeriodTypeChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select period type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="monthly">Monthly (12 periods)</SelectItem>
                    <SelectItem value="bi-monthly">Bi-monthly (6 periods)</SelectItem>
                    <SelectItem value="quarterly">Quarterly (4 periods)</SelectItem>
                    <SelectItem value="biannually">Bi-annually (2 periods)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Forecast Coverage</Label>
                <div className="text-sm font-medium mt-1">
                  {periods.length} {periodType.replace('_', '-')} periods
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  One year forecast starting from {startingPeriod.replace('-', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active filters summary */}
          {hasFilters && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">✓</span>
                  Active Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {productType !== 'all' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Products:</span>
                      <Badge variant="secondary" className="text-xs">{productType.replace('_', ' ')}</Badge>
                    </div>
                  )}
                  {accountType !== 'all' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Account:</span>
                      <Badge variant="secondary" className="text-xs">{accountType.replace('_', ' ')}</Badge>
                    </div>
                  )}
                  {program !== 'all' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Program:</span>
                      <Badge variant="secondary" className="text-xs">{program.replace('_', ' ')}</Badge>
                    </div>
                  )}
                  {selectedDrugs.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-16">Drugs:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDrugs.map((drug) => (
                          <Badge key={drug} variant="secondary" className="text-xs">{drug}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};