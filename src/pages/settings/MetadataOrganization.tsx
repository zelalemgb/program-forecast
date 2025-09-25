import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Package, 
  Users, 
  MapPin, 
  FileText, 
  Upload,
  Factory,
  FolderOpen,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

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
      title: "EPSS Regional Hubs",
      description: "Manage EPSS regional distribution hubs",
      icon: Factory,
      path: "/settings/metadata/regional-hubs",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
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
      title: "Account Types",
      description: "Manage account types and their associated drug lists",
      icon: FolderOpen,
      path: "/settings/metadata/account-types",
      color: "text-teal-600",
      bgColor: "bg-teal-100"
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
    <PageLayout>
      <Helmet>
        <title>Metadata Organization | System Settings</title>
        <meta name="description" content="Manage health facilities, products, users, and other metadata objects through manual entry or bulk import." />
        <link rel="canonical" href="/settings/metadata" />
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metadataCategories.map((category) => (
          <Card 
            key={category.path}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(category.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};

export default MetadataOrganization;