-- Update existing inventory balances or insert if they don't exist
-- For Tikur Anbessa Hospital (facility_id: 1)
INSERT INTO inventory_balances (
  facility_id, product_id, current_stock, reorder_level, max_level,
  reserved_stock, minimum_stock_level, maximum_stock_level, 
  safety_stock_level, average_monthly_consumption,
  last_transaction_date, last_consumption_date, last_receipt_date
) VALUES
-- Paracetamol balance (21000 received - 4100 issued = 16900)
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 16900, 2000, 25000, 0, 1500, 25000, 2500, 456, '2024-09-22', '2024-09-22', '2024-09-15'),

-- Amoxicillin balance (9000 received - 2395 issued = 6605)
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 6605, 1000, 10000, 0, 800, 10000, 1200, 299, '2024-08-30', '2024-08-30', '2024-07-10'),

-- Metformin balance (6000 received - 1365 issued = 4635)
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 4635, 500, 7000, 0, 400, 7000, 600, 195, '2024-08-28', '2024-08-28', '2024-08-25'),

-- Ibuprofen balance (12000 received - 2310 issued = 9690)
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 9690, 1500, 15000, 0, 1200, 15000, 1800, 330, '2024-08-25', '2024-08-25', '2024-08-15'),

-- ORS balance (4900 received - 1170 issued = 3730)
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 3730, 400, 5000, 0, 300, 5000, 500, 146, '2024-09-25', '2024-09-25', '2024-09-20'),

-- For Debre Berhan Health Center (facility_id: 2)
-- Paracetamol balance (9000 received - 2390 issued = 6610)
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 6610, 1200, 12000, 0, 1000, 12000, 1400, 299, '2024-09-20', '2024-09-20', '2024-08-10'),

-- Amoxicillin balance (3200 received - 1170 issued = 2030)
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 2030, 600, 5000, 0, 500, 5000, 700, 195, '2024-07-28', '2024-07-28', '2024-06-20'),

-- ORS balance (1700 received - 765 issued = 935)
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 935, 200, 2000, 0, 150, 2000, 250, 113, '2024-09-15', '2024-09-15', '2024-07-15')

ON CONFLICT (facility_id, product_id) 
DO UPDATE SET 
  current_stock = EXCLUDED.current_stock,
  reorder_level = EXCLUDED.reorder_level,
  max_level = EXCLUDED.max_level,
  reserved_stock = EXCLUDED.reserved_stock,
  minimum_stock_level = EXCLUDED.minimum_stock_level,
  maximum_stock_level = EXCLUDED.maximum_stock_level,
  safety_stock_level = EXCLUDED.safety_stock_level,
  average_monthly_consumption = EXCLUDED.average_monthly_consumption,
  last_transaction_date = EXCLUDED.last_transaction_date,
  last_consumption_date = EXCLUDED.last_consumption_date,
  last_receipt_date = EXCLUDED.last_receipt_date,
  last_updated = now();