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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Analysis Filters</Label>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Product Type</Label>
          <Select value={productType} onValueChange={onProductTypeChange}>
            <SelectTrigger className="h-8 bg-background">
              <SelectValue />
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
          <Label className="text-xs font-medium text-muted-foreground">Account Type</Label>
          <Select value={accountType} onValueChange={onAccountTypeChange}>
            <SelectTrigger className="h-8 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
              <SelectItem value="faith_based">Faith-based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Program</Label>
          <Select value={program} onValueChange={onProgramChange}>
            <SelectTrigger className="h-8 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="maternal_health">Maternal Health</SelectItem>
              <SelectItem value="child_health">Child Health</SelectItem>
              <SelectItem value="reproductive_health">Reproductive Health</SelectItem>
              <SelectItem value="malaria">Malaria</SelectItem>
              <SelectItem value="tuberculosis">Tuberculosis</SelectItem>
              <SelectItem value="hiv_aids">HIV/AIDS</SelectItem>
              <SelectItem value="nutrition">Nutrition</SelectItem>
              <SelectItem value="immunization">Immunization</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-1">
          {productType !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Product: {productType.replace('_', ' ')}
            </Badge>
          )}
          {accountType !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Account: {accountType.replace('_', ' ')}
            </Badge>
          )}
          {program !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Program: {program.replace('_', ' ')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};