import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AnalysisFiltersProps {
  productType: string;
  accountType: string;
  program: string;
  onProductTypeChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onClearFilters: () => void;
}

export const AnalysisFilters: React.FC<AnalysisFiltersProps> = ({
  productType,
  accountType,
  program,
  onProductTypeChange,
  onAccountTypeChange,
  onProgramChange,
  onClearFilters
}) => {
  const hasFilters = productType !== 'all' || accountType !== 'all' || program !== 'all';

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
        {/* Step 1: Product Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">1</div>
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

        {/* Step 2: Target Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">2</div>
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
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">3</div>
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
        </div>
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Active Filters:</Label>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      )}
    </div>
  );
};