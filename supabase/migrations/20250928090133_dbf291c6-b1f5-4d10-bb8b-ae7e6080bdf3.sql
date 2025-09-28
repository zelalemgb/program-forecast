-- Successfully generate comprehensive real-world inventory data

-- Generate realistic inventory transactions covering all scenarios
INSERT INTO public.inventory_transactions (
  facility_id, product_id, transaction_type, quantity, unit_cost,
  transaction_date, expiry_date, batch_number, reference_number,
  supplier_name, grn_number, notes, department
)
SELECT 
  f.facility_id,
  p.id,
  CASE 
    WHEN random() < 0.35 THEN 'receipt'
    WHEN random() < 0.65 THEN 'issue'
    WHEN random() < 0.8 THEN 'adjustment'
    WHEN random() < 0.93 THEN 'loss'
    ELSE 'expired'
  END as transaction_type,
  CASE 
    WHEN random() < 0.35 THEN FLOOR(random() * 800 + 100)::numeric -- Receipt: larger quantities
    WHEN random() < 0.65 THEN -FLOOR(random() * 150 + 20)::numeric -- Issue: negative for consumption
    WHEN random() < 0.8 THEN FLOOR(random() * 30 - 15)::numeric -- Adjustment: positive or negative
    WHEN random() < 0.93 THEN -FLOOR(random() * 15 + 1)::numeric -- Loss: negative
    ELSE -FLOOR(random() * 8 + 1)::numeric -- Expired: negative
  END as quantity,
  random() * 15 + 2 as unit_cost,
  (CURRENT_DATE - INTERVAL '1 day' * FLOOR(random() * 200))::date as transaction_date,
  (CURRENT_DATE + INTERVAL '1 day' * FLOOR(random() * 400 + 200))::date as expiry_date,
  'BATCH-' || LPAD(FLOOR(random() * 99999)::text, 5, '0') as batch_number,
  CASE 
    WHEN random() < 0.5 THEN 'EPSS-' || LPAD(FLOOR(random() * 9999)::text, 4, '0')
    ELSE 'SUP-' || LPAD(FLOOR(random() * 999)::text, 3, '0')
  END as reference_number,
  CASE 
    WHEN random() < 0.4 THEN 'EPSS Regional Hub'
    WHEN random() < 0.6 THEN 'PFSA Central Store'
    WHEN random() < 0.8 THEN 'Emergency Supply Network'
    ELSE 'Local Pharmaceutical Supplier'
  END as supplier_name,
  'GRN-' || LPAD(FLOOR(random() * 99999)::text, 5, '0') as grn_number,
  CASE 
    WHEN random() < 0.1 THEN 'Emergency delivery - critical shortage'
    WHEN random() < 0.2 THEN 'Regular monthly supply from regional hub'
    WHEN random() < 0.3 THEN 'Ward requisition - internal transfer'
    WHEN random() < 0.4 THEN 'Stock adjustment after physical count'
    ELSE NULL
  END as notes,
  CASE 
    WHEN random() < 0.3 THEN 'Pharmacy'
    WHEN random() < 0.5 THEN 'Main Store'
    WHEN random() < 0.7 THEN 'Emergency Ward'
    WHEN random() < 0.85 THEN 'Pediatric Ward'
    ELSE 'Outpatient Department'
  END as department
FROM 
  (SELECT facility_id, facility_name, facility_type FROM public.facility WHERE facility_type IS NOT NULL LIMIT 12) f
CROSS JOIN 
  (SELECT id, name FROM public.products LIMIT 10) p
CROSS JOIN 
  generate_series(1, 6) -- Generate multiple transactions per product per facility
WHERE random() < 0.75; -- 75% chance each combination gets transactions

-- Generate realistic current inventory balances with all scenarios
INSERT INTO public.inventory_balances (
  facility_id, product_id, current_stock, reorder_level, max_level,
  last_transaction_date, reserved_stock, minimum_stock_level,
  maximum_stock_level, safety_stock_level, average_monthly_consumption,
  last_consumption_date, last_receipt_date
)
SELECT 
  f.facility_id,
  p.id,
  CASE 
    -- Realistic distribution of stock levels
    WHEN random() < 0.08 THEN 0 -- Stockout (8%)
    WHEN random() < 0.20 THEN FLOOR(random() * 50 + 5)::numeric -- Very low stock (12%)
    WHEN random() < 0.35 THEN FLOOR(random() * 150 + 50)::numeric -- Low stock (15%)
    WHEN random() < 0.50 THEN FLOOR(random() * 300 + 150)::numeric -- Below reorder (15%)
    WHEN random() < 0.80 THEN FLOOR(random() * 800 + 300)::numeric -- Normal range (30%)
    WHEN random() < 0.92 THEN FLOOR(random() * 1500 + 800)::numeric -- Good stock (12%)
    ELSE FLOOR(random() * 2500 + 1500)::numeric -- Overstocked (8%)
  END as current_stock,
  FLOOR(random() * 200 + 100)::numeric as reorder_level,
  FLOOR(random() * 1000 + 500)::numeric as max_level,
  (CURRENT_DATE - INTERVAL '1 day' * FLOOR(random() * 45))::date as last_transaction_date,
  CASE 
    WHEN random() < 0.4 THEN FLOOR(random() * 50 + 5)::numeric
    ELSE 0
  END as reserved_stock,
  FLOOR(random() * 75 + 25)::numeric as minimum_stock_level,
  FLOOR(random() * 1000 + 400)::numeric as maximum_stock_level,
  FLOOR(random() * 60 + 30)::numeric as safety_stock_level,
  CASE 
    WHEN f.facility_type = 'Hospital' THEN FLOOR(random() * 250 + 100)::numeric
    WHEN f.facility_type = 'Health Center' THEN FLOOR(random() * 120 + 50)::numeric
    ELSE FLOOR(random() * 60 + 25)::numeric
  END as average_monthly_consumption,
  (CURRENT_DATE - INTERVAL '1 day' * FLOOR(random() * 15))::date as last_consumption_date,
  (CURRENT_DATE - INTERVAL '1 day' * FLOOR(random() * 25))::date as last_receipt_date
FROM 
  (SELECT facility_id, facility_name, facility_type FROM public.facility WHERE facility_type IS NOT NULL LIMIT 12) f
CROSS JOIN 
  (SELECT id, name FROM public.products LIMIT 10) p
ON CONFLICT (facility_id, product_id) DO UPDATE SET
  current_stock = EXCLUDED.current_stock,
  last_transaction_date = EXCLUDED.last_transaction_date,
  average_monthly_consumption = EXCLUDED.average_monthly_consumption;

-- Generate 6 months of consumption analytics (excluding generated amc column)
INSERT INTO public.consumption_analytics (
  facility_id, product_id, period_start, period_end,
  consumption_quantity, adjustments, wastage, stockout_days
)
SELECT 
  f.facility_id,
  p.id,
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * month_offset)::date as period_start,
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * month_offset + INTERVAL '1 month' - INTERVAL '1 day')::date as period_end,
  CASE 
    WHEN f.facility_type = 'Hospital' THEN FLOOR(random() * 400 + 150)::numeric
    WHEN f.facility_type = 'Health Center' THEN FLOOR(random() * 200 + 75)::numeric
    ELSE FLOOR(random() * 100 + 40)::numeric
  END as consumption_quantity,
  FLOOR(random() * 20 + 3)::numeric as adjustments,
  FLOOR(random() * 12 + 2)::numeric as wastage,
  CASE 
    WHEN random() < 0.15 THEN FLOOR(random() * 10 + 1)::integer
    ELSE 0
  END as stockout_days
FROM 
  (SELECT facility_id, facility_name, facility_type FROM public.facility WHERE facility_type IS NOT NULL LIMIT 12) f
CROSS JOIN 
  (SELECT id, name FROM public.products LIMIT 10) p
CROSS JOIN 
  generate_series(0, 5) as month_offset
WHERE random() < 0.85
ON CONFLICT (facility_id, product_id, period_start, period_end) DO NOTHING;