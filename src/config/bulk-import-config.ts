// Centralized configuration for bulk import functionality

export interface ImportType {
  value: string;
  label: string;
  icon: string;
  table: string;
}

export interface DatabaseField {
  value: string;
  label: string;
  required: boolean;
  type?: 'string' | 'number' | 'email' | 'uuid' | 'enum' | 'json';
  maxLength?: number;
  enumValues?: string[];
}

export interface ImportFieldConfig {
  [importType: string]: DatabaseField[];
}

export const IMPORT_TYPES: ImportType[] = [
  { value: "facilities", label: "Health Facilities", icon: "🏥", table: "facility" },
  { value: "regional_hubs", label: "EPSS Regional Hubs", icon: "🏭", table: "epss_regional_hubs" },
  { value: "products", label: "Products & Medicines", icon: "💊", table: "product_reference" },
  { value: "users", label: "Users & Staff", icon: "👥", table: "profiles" },
  { value: "areas", label: "Administrative Areas", icon: "🗺️", table: "woreda" },
  { value: "suppliers", label: "Suppliers & Vendors", icon: "🏢", table: "suppliers" },
  { value: "inventory", label: "Inventory Balances", icon: "📦", table: "inventory_balances" }
];

export const DATABASE_FIELD_CONFIG: ImportFieldConfig = {
  facilities: [
    { value: "facility_name", label: "Facility Name", required: true, type: "string", maxLength: 20 },
    { value: "facility_code", label: "Facility Code", required: false, type: "string", maxLength: 20 },
    { value: "facility_type", label: "Facility Type", required: false, type: "string", maxLength: 20 },
    { value: "region_id", label: "Region ID", required: false, type: "number" },
    { value: "zone_id", label: "Zone ID", required: false, type: "number" },
    { value: "woreda_id", label: "Woreda ID", required: false, type: "number" },
    { value: "regional_hub_id", label: "Regional Hub ID", required: false, type: "uuid" },
    { value: "ownership_type", label: "Ownership Type", required: false, type: "enum", enumValues: ["public", "private", "ngo"] },
    { value: "level", label: "Level", required: false, type: "string" },
    { value: "ownership", label: "Ownership", required: false, type: "string" },
    { value: "latitude", label: "Latitude", required: false, type: "number" },
    { value: "longitude", label: "Longitude", required: false, type: "number" }
  ],
  regional_hubs: [
    { value: "hub_code", label: "Hub Code", required: true, type: "string", maxLength: 50 },
    { value: "hub_name", label: "Hub Name", required: true, type: "string", maxLength: 100 },
    { value: "region_id", label: "Region ID", required: false, type: "number" },
    { value: "contact_person", label: "Contact Person", required: false, type: "string" },
    { value: "contact_phone", label: "Contact Phone", required: false, type: "string" },
    { value: "contact_email", label: "Contact Email", required: false, type: "email" },
    { value: "address", label: "Address", required: false, type: "string" },
    { value: "latitude", label: "Latitude", required: false, type: "number" },
    { value: "longitude", label: "Longitude", required: false, type: "number" }
  ],
  products: [
    { value: "canonical_name", label: "Product Name", required: true, type: "string" },
    { value: "code", label: "Product Code", required: false, type: "string" },
    { value: "product_type", label: "Product Type", required: false, type: "string" },
    { value: "program", label: "Program", required: false, type: "string" },
    { value: "atc_code", label: "ATC Code", required: false, type: "string" },
    { value: "strength", label: "Strength", required: false, type: "string" },
    { value: "form", label: "Form", required: false, type: "string" },
    { value: "pack_size", label: "Pack Size", required: false, type: "number" },
    { value: "base_unit", label: "Base Unit", required: true, type: "string" },
    { value: "default_unit", label: "Default Unit", required: false, type: "string" },
    { value: "unit_to_base_factor", label: "Unit to Base Factor", required: false, type: "number" },
    { value: "price_benchmark_low", label: "Price Benchmark Low", required: false, type: "number" },
    { value: "price_benchmark_high", label: "Price Benchmark High", required: false, type: "number" }
  ],
  users: [
    { value: "full_name", label: "Full Name", required: true, type: "string" },
    { value: "email", label: "Email", required: true, type: "email" },
    { value: "phone_number", label: "Phone Number", required: false, type: "string" }
  ],
  areas: [
    { value: "woreda_name", label: "Woreda Name", required: true, type: "string" },
    { value: "zone_id", label: "Zone ID", required: true, type: "number" }
  ],
  suppliers: [
    { value: "name", label: "Supplier Name", required: true, type: "string" },
    { value: "contact_info", label: "Contact Info", required: false, type: "json" }
  ],
  inventory: [
    { value: "facility_id", label: "Facility ID", required: true, type: "number" },
    { value: "product_id", label: "Product ID", required: true, type: "uuid" },
    { value: "current_stock", label: "Current Stock", required: true, type: "number" },
    { value: "reorder_level", label: "Reorder Level", required: false, type: "number" },
    { value: "max_level", label: "Max Level", required: false, type: "number" },
    { value: "minimum_stock_level", label: "Minimum Stock Level", required: false, type: "number" },
    { value: "maximum_stock_level", label: "Maximum Stock Level", required: false, type: "number" },
    { value: "average_monthly_consumption", label: "Average Monthly Consumption", required: false, type: "number" }
  ]
};

export const getImportTypeConfig = (importType: string): ImportType | undefined => {
  return IMPORT_TYPES.find(type => type.value === importType);
};

export const getDatabaseFields = (importType: string): DatabaseField[] => {
  return DATABASE_FIELD_CONFIG[importType] || [];
};