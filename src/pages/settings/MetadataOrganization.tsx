import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Package, 
  Users, 
  MapPin, 
  FileText, 
  Upload,
  Plus,
  Database
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const MetadataOrganization: React.FC = () => {
  const navigate = useNavigate();

  const metadataCategories = [
    {
      title: "Health Facilities",
      description: "Manage hospitals, clinics, and health centers",
      icon: Building2,
      path: "/settings/metadata/facilities",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Products & Medicines",
      description: "Manage pharmaceutical products and medical supplies",
      icon: Package,
      path: "/settings/metadata/products", 
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Users & Staff",
      description: "Manage user profiles and staff information",
      icon: Users,
      path: "/settings/metadata/users",
      color: "text-purple-600", 
      bgColor: "bg-purple-100"
    },
    {
      title: "Administrative Areas",
      description: "Manage regions, zones, and woredas",
      icon: MapPin,
      path: "/settings/metadata/areas",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Suppliers & Vendors",
      description: "Manage supplier and vendor information",
      icon: FileText,
      path: "/settings/metadata/suppliers",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Bulk Import",
      description: "Import data from Excel/CSV files",
      icon: Upload,
      path: "/settings/metadata/bulk-import",
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Metadata Organization | System Settings</title>
        <meta name="description" content="Manage health facilities, products, users, and other metadata objects through manual entry or bulk import." />
        <link rel="canonical" href="/settings/metadata" />
      </Helmet>

      <PageHeader
        title="Metadata Organization"
        description="Manage system metadata including facilities, products, users, and administrative data"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metadataCategories.map((category) => (
          <Card 
            key={category.path}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(category.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(category.path);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${category.path}?tab=manage`);
                  }}
                >
                  <Database className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-muted-foreground">Facilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">150+</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">25</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-muted-foreground">Woredas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">8</div>
              <div className="text-sm text-muted-foreground">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">2.1K</div>
              <div className="text-sm text-muted-foreground">Records</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MetadataOrganization;