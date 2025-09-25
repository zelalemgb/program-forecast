// Example data structures for hierarchical bulk import

export const FACILITY_IMPORT_EXAMPLE = [
  {
    facility_name: "Addis Ababa University Hospital",
    facility_code: "AAU001",
    facility_type: "Hospital",
    country_name: "Ethiopia",
    region_name: "Addis Ababa",
    zone_name: "Addis Ababa Zone",
    woreda_name: "Kirkos",
    ownership: "Public",
    ownership_type: "public"
  },
  {
    facility_name: "Black Lion Hospital",
    facility_code: "BLH001", 
    facility_type: "Hospital",
    country_name: "Ethiopia",
    region_name: "Addis Ababa",
    zone_name: "Addis Ababa Zone", 
    woreda_name: "Arada Sub City Woreda",
    ownership: "Public",
    ownership_type: "public"
  },
  {
    facility_name: "Mekelle Hospital",
    facility_code: "MEK001",
    facility_type: "Hospital", 
    country_name: "Ethiopia",
    region_name: "Tigray",
    zone_name: "Central",
    woreda_name: "Mekelle",
    ownership: "Public",
    ownership_type: "public"
  }
];

export const HIERARCHY_IMPORT_TEMPLATE = {
  Country: "Ethiopia",
  Region: "Region Name (e.g., Addis Ababa, Tigray, Amhara)",
  Zone: "Zone Name (e.g., Addis Ababa Zone, Central)",
  Woreda: "Woreda Name (e.g., Kirkos, Arada Sub City Woreda)",
  "Facility Name": "Health Facility Name",
  "Facility Code": "Unique facility identifier",
  "Facility Type": "Hospital, Health Center, Clinic, etc.",
  "Ownership": "Public, Private, NGO",
  "Ownership Type": "public, private, ngo"
};

export const FACILITY_CSV_HEADERS = [
  "facility_name",
  "facility_code", 
  "facility_type",
  "country_name",
  "region_name",
  "zone_name", 
  "woreda_name",
  "ownership",
  "ownership_type",
  "latitude",
  "longitude"
];