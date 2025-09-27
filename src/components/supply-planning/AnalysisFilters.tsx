import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Search } from 'lucide-react';

interface AnalysisFiltersProps {
  periodType: string;
  startingPeriod: string;
  productType: string;
  accountType: string;
  program: string;
  onPeriodTypeChange: (value: string) => void;
  onStartingPeriodChange: (value: string) => void;
  onProductTypeChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onClearFilters: () => void;
  periods: string[];
  selectedDrugs?: string[];
  onDrugsChange?: (drugs: string[]) => void;
}

export const AnalysisFilters: React.FC<AnalysisFiltersProps> = ({
  periodType,
  startingPeriod,
  productType,
  accountType,
  program,
  onPeriodTypeChange,
  onStartingPeriodChange,
  onProductTypeChange,
  onAccountTypeChange,
  onProgramChange,
  onClearFilters,
  periods,
  selectedDrugs = [],
  onDrugsChange
}) => {
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  const hasFilters = periodType !== 'monthly' || startingPeriod !== 'hamle-2017' || productType !== 'all' || accountType !== 'all' || program !== 'all' || selectedDrugs.length > 0;

  // Mock drug database - in real app, this would come from your backend
  const availableDrugs = [
    'Paracetamol 500mg Tablets',
    'Amoxicillin 250mg Capsules',
    'ORS Sachets',
    'Albendazole 400mg Tablets',
    'Artesunate + Amodiaquine',
    'Ciprofloxacin 500mg Tablets',
    'Cotrimoxazole 480mg Tablets',
    'Dextrose 5% Solution',
    'Ferrous Sulfate 200mg Tablets',
    'Gentamicin 80mg/2ml Injection',
    'Ibuprofen 400mg Tablets',
    'Metronidazole 250mg Tablets',
    'Normal Saline 0.9%',
    'Oral Contraceptive Pills',
    'Tetanus Toxoid Vaccine'
  ];

  const handleDrugSearch = (searchTerm: string) => {
    setDrugSearchTerm(searchTerm);
    if (searchTerm.length > 1) {
      const filtered = availableDrugs.filter(drug => 
        drug.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedDrugs.includes(drug)
      );
      setSearchResults(filtered.slice(0, 5)); // Show top 5 results
    } else {
      setSearchResults([]);
    }
  };

  const handleAddDrug = (drug: string) => {
    if (onDrugsChange && !selectedDrugs.includes(drug)) {
      onDrugsChange([...selectedDrugs, drug]);
    }
    setDrugSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveDrug = (drugToRemove: string) => {
    if (onDrugsChange) {
      onDrugsChange(selectedDrugs.filter(drug => drug !== drugToRemove));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Analysis Configuration</h3>
          <p className="text-xs text-muted-foreground">Configure what to include in your supply planning analysis</p>
        </div>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>
      
      {/* Step-by-step filter flow */}
      <div className="space-y-4">
        {/* Step 1: Period Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">1</div>
              <Label className="text-sm font-medium">Analysis Period Type</Label>
            </div>
            <Select value={periodType} onValueChange={onPeriodTypeChange}>
              <SelectTrigger className="h-9 bg-background border-2">
                <SelectValue placeholder="Choose period type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="monthly">Monthly Analysis (12 periods)</SelectItem>
                <SelectItem value="bi-monthly">Bi-monthly Analysis (6 periods)</SelectItem>
                <SelectItem value="quarterly">Quarterly Analysis (4 periods)</SelectItem>
                <SelectItem value="biannually">Bi-annual Analysis (2 periods)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">2</div>
              <Label className="text-sm font-medium">Starting Period</Label>
            </div>
            <Select value={startingPeriod} onValueChange={onStartingPeriodChange}>
              <SelectTrigger className="h-9 bg-background border-2">
                <SelectValue placeholder="Choose starting period" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="hamle-2017">Start from Hamle 2017 EC</SelectItem>
                <SelectItem value="hamle-2018">Start from Hamle 2018 EC</SelectItem>
                <SelectItem value="hamle-2019">Start from Hamle 2019 EC</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Will generate {periods.length} {periodType} periods
            </div>
          </div>
        </div>

        {/* Step 3: Product Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">3</div>
            <Label className="text-sm font-medium">Select Product Type</Label>
          </div>
          <Select value={productType} onValueChange={onProductTypeChange}>
            <SelectTrigger className="h-9 bg-background border-2">
              <SelectValue placeholder="Choose product category" />
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

        {/* Step 4: Target Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">4</div>
              <Label className="text-sm font-medium">Target Account Type</Label>
            </div>
            <Select value={accountType} onValueChange={onAccountTypeChange}>
              <SelectTrigger className="h-9 bg-background border-2">
                <SelectValue placeholder="Choose account type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">All Account Types</SelectItem>
                <SelectItem value="public">Public Facilities</SelectItem>
                <SelectItem value="private">Private Facilities</SelectItem>
                <SelectItem value="ngo">NGO Facilities</SelectItem>
                <SelectItem value="faith_based">Faith-based Facilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">5</div>
              <Label className="text-sm font-medium">Health Program Focus</Label>
            </div>
            <Select value={program} onValueChange={onProgramChange}>
              <SelectTrigger className="h-9 bg-background border-2">
                <SelectValue placeholder="Choose health program" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">All Health Programs</SelectItem>
                <SelectItem value="maternal_health">Maternal Health</SelectItem>
                <SelectItem value="child_health">Child Health</SelectItem>
                <SelectItem value="reproductive_health">Reproductive Health</SelectItem>
                <SelectItem value="malaria">Malaria Prevention</SelectItem>
                <SelectItem value="tuberculosis">Tuberculosis Control</SelectItem>
                <SelectItem value="hiv_aids">HIV/AIDS Prevention</SelectItem>
                <SelectItem value="nutrition">Nutrition Programs</SelectItem>
                <SelectItem value="immunization">Immunization</SelectItem>
                <SelectItem value="emergency">Emergency Response</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Step 6: Specific Drug Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">6</div>
            <Label className="text-sm font-medium">Add Specific Drugs (Optional)</Label>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for specific drugs to include..."
                  value={drugSearchTerm}
                  onChange={(e) => handleDrugSearch(e.target.value)}
                  className="pl-9 h-9 border-2"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {searchResults.map((drug, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddDrug(drug)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 border-b border-border last:border-b-0"
                    >
                      <Plus className="h-3 w-3 text-muted-foreground" />
                      {drug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Drugs */}
            {selectedDrugs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Selected Drugs:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDrugs.map((drug, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-1 flex items-center gap-1">
                      {drug}
                      <button
                        onClick={() => handleRemoveDrug(drug)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Active Configuration:</Label>
          <div className="flex flex-wrap gap-2">
            {periodType !== 'monthly' && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {periodType} periods
              </Badge>
            )}
            {startingPeriod !== 'hamle-2017' && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                Starting {startingPeriod.replace('-', ' ')}
              </Badge>
            )}
            {productType !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {productType.replace('_', ' ')}
              </Badge>
            )}
            {accountType !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {accountType.replace('_', ' ')} accounts
              </Badge>
            )}
            {program !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {program.replace('_', ' ')} program
              </Badge>
            )}
            {selectedDrugs.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {selectedDrugs.length} specific drug{selectedDrugs.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};