-- Create EPSS Regional Hubs table
CREATE TABLE public.epss_regional_hubs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hub_code VARCHAR(50) NOT NULL UNIQUE,
    hub_name VARCHAR(255) NOT NULL,
    region_id INTEGER REFERENCES public.region(region_id),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    address TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    active_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key to facility table for regional hub relationship
ALTER TABLE public.facility 
ADD COLUMN regional_hub_id UUID REFERENCES public.epss_regional_hubs(id);

-- Create indexes for better performance
CREATE INDEX idx_epss_regional_hubs_region_id ON public.epss_regional_hubs(region_id);
CREATE INDEX idx_epss_regional_hubs_hub_code ON public.epss_regional_hubs(hub_code);
CREATE INDEX idx_facility_regional_hub_id ON public.facility(regional_hub_id);

-- Enable RLS on the new table
ALTER TABLE public.epss_regional_hubs ENABLE ROW LEVEL SECURITY;

-- RLS policies for EPSS Regional Hubs
CREATE POLICY "All authenticated users can view regional hubs" 
ON public.epss_regional_hubs 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and analysts can modify regional hubs" 
ON public.epss_regional_hubs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_epss_regional_hubs_updated_at
BEFORE UPDATE ON public.epss_regional_hubs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample regional hubs data with correct region IDs
INSERT INTO public.epss_regional_hubs (hub_code, hub_name, region_id, contact_person, contact_phone, contact_email, address) VALUES
('EPSS-ADD', 'Addis Ababa Regional Hub', 1, 'Dr. Alemayehu Tadesse', '+251-11-123-4567', 'alemayehu.tadesse@epss.gov.et', 'Addis Ababa, Ethiopia'),
('EPSS-AMH', 'Amhara Regional Hub', 2, 'Dr. Getinet Molla', '+251-58-345-6789', 'getinet.molla@epss.gov.et', 'Bahir Dar, Amhara, Ethiopia'),
('EPSS-ORM', 'Oromia Regional Hub', 3, 'Dr. Chaltu Bekele', '+251-11-234-5678', 'chaltu.bekele@epss.gov.et', 'Adama, Oromia, Ethiopia'),
('EPSS-SNP', 'SNNP Regional Hub', 4, 'Dr. Yohannes Wolde', '+251-46-890-1234', 'yohannes.wolde@epss.gov.et', 'Hawassa, SNNP, Ethiopia'),
('EPSS-TIG', 'Tigray Regional Hub', 5, 'Dr. Hailay Gebremariam', '+251-34-456-7890', 'hailay.gebremariam@epss.gov.et', 'Mekelle, Tigray, Ethiopia');