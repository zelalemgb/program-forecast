import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Building, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FacilityCompletenessProps {
  facilityId: number;
}

interface CompletenessItem {
  field: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
}

export const FacilityCompletenessCard: React.FC<FacilityCompletenessProps> = ({ facilityId }) => {
  const [completenessItems, setCompletenessItems] = React.useState<CompletenessItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [facilityName, setFacilityName] = React.useState<string>("");

  React.useEffect(() => {
    const loadFacilityData = async () => {
      try {
        setLoading(true);
        
        // Fetch facility data
        const { data: facility, error } = await supabase
          .from('facility')
          .select('*')
          .eq('facility_id', facilityId)
          .maybeSingle();

        if (error) throw error;
        
        if (facility) {
          setFacilityName(facility.facility_name);
          
          // Check completeness of various fields
          const items: CompletenessItem[] = [
            {
              field: 'facility_name',
              label: 'Facility Name',
              icon: <Building className="h-4 w-4" />,
              completed: !!facility.facility_name,
              required: true
            },
            {
              field: 'facility_code',
              label: 'Facility Code',
              icon: <Building className="h-4 w-4" />,
              completed: !!facility.facility_code,
              required: true
            },
            {
              field: 'facility_type',
              label: 'Facility Type',
              icon: <Building className="h-4 w-4" />,
              completed: !!facility.facility_type,
              required: true
            },
            {
              field: 'coordinates',
              label: 'GPS Coordinates',
              icon: <MapPin className="h-4 w-4" />,
              completed: !!(facility.latitude && facility.longitude),
              required: false
            },
            {
              field: 'level',
              label: 'Facility Level',
              icon: <Building className="h-4 w-4" />,
              completed: !!facility.level,
              required: false
            },
            {
              field: 'ownership_type',
              label: 'Ownership Type',
              icon: <Building className="h-4 w-4" />,
              completed: !!facility.ownership_type,
              required: false
            }
          ];

          setCompletenessItems(items);
        }
      } catch (error) {
        console.error('Error loading facility data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      loadFacilityData();
    }
  }, [facilityId]);

  const completedItems = completenessItems.filter(item => item.completed);
  const requiredItems = completenessItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed);
  
  // Calculate percentage based on all items
  const totalPercentage = completenessItems.length > 0 
    ? Math.round((completedItems.length / completenessItems.length) * 100)
    : 0;

  // Calculate required percentage
  const requiredPercentage = requiredItems.length > 0 
    ? Math.round((completedRequired.length / requiredItems.length) * 100)
    : 100;

  const getStatusBadge = () => {
    if (requiredPercentage === 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
    } else if (requiredPercentage >= 75) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Nearly Complete</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Incomplete</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="max-w-xl surface">
        <CardHeader>
          <CardTitle>Facility Profile Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse bg-muted h-4 rounded w-3/4"></div>
            <div className="animate-pulse bg-muted h-2 rounded w-full"></div>
            <div className="space-y-2">
              <div className="animate-pulse bg-muted h-4 rounded w-2/3"></div>
              <div className="animate-pulse bg-muted h-4 rounded w-1/2"></div>
              <div className="animate-pulse bg-muted h-4 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Facility Profile Completeness</CardTitle>
          {getStatusBadge()}
        </div>
        {facilityName && (
          <p className="text-sm text-muted-foreground">{facilityName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Completeness</span>
            <span className="font-medium">{totalPercentage}%</span>
          </div>
          <Progress value={totalPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedItems.length} of {completenessItems.length} fields completed
          </p>
        </div>

        {/* Required Fields Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Required Fields</span>
            <span className="font-medium">{requiredPercentage}%</span>
          </div>
          <Progress value={requiredPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedRequired.length} of {requiredItems.length} required fields completed
          </p>
        </div>

        {/* Field Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Field Status</h4>
          <div className="space-y-2">
            {completenessItems.map((item) => (
              <div key={item.field} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  {item.icon}
                  <span className={item.required ? "font-medium" : ""}>{item.label}</span>
                  {item.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilityCompletenessCard;