-- Generate sample inventory transactions for multiple facilities over the past 12 months
-- For Tikur Anbessa Hospital (facility_id: 1)

-- Receiving transactions (stock in)
INSERT INTO inventory_transactions (
  facility_id, product_id, user_id, quantity, unit_cost, 
  transaction_type, transaction_date, supplier_name, 
  grn_number, batch_number, notes
) VALUES
-- Paracetamol receipts
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 5000, 0.25, 'receipt', '2024-01-15', 'Ethiopian Pharmaceuticals', 'GRN-2024-001', 'PAR-2024-001', 'Monthly stock replenishment'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 4500, 0.25, 'receipt', '2024-03-10', 'Ethiopian Pharmaceuticals', 'GRN-2024-015', 'PAR-2024-003', 'Quarterly stock delivery'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 6000, 0.25, 'receipt', '2024-06-20', 'Ethiopian Pharmaceuticals', 'GRN-2024-035', 'PAR-2024-006', 'Mid-year restocking'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 5500, 0.25, 'receipt', '2024-09-15', 'Ethiopian Pharmaceuticals', 'GRN-2024-055', 'PAR-2024-009', 'Q3 stock delivery'),

-- Amoxicillin receipts
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 3000, 1.50, 'receipt', '2024-01-20', 'Addis Pharmaceuticals', 'GRN-2024-003', 'AMX-2024-001', 'Antibiotic restocking'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 2800, 1.50, 'receipt', '2024-04-15', 'Addis Pharmaceuticals', 'GRN-2024-022', 'AMX-2024-004', 'Spring delivery'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 3200, 1.50, 'receipt', '2024-07-10', 'Addis Pharmaceuticals', 'GRN-2024-040', 'AMX-2024-007', 'Summer stock update'),

-- Metformin receipts
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 2000, 2.75, 'receipt', '2024-02-05', 'Diabetes Care Ltd', 'GRN-2024-008', 'MET-2024-001', 'Diabetes medication supply'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 2200, 2.75, 'receipt', '2024-05-20', 'Diabetes Care Ltd', 'GRN-2024-028', 'MET-2024-005', 'Regular monthly delivery'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1800, 2.75, 'receipt', '2024-08-25', 'Diabetes Care Ltd', 'GRN-2024-048', 'MET-2024-008', 'Late summer delivery'),

-- Ibuprofen receipts
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 4000, 0.35, 'receipt', '2024-01-25', 'Pain Relief Suppliers', 'GRN-2024-005', 'IBU-2024-001', 'Pain management stock'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 3800, 0.35, 'receipt', '2024-05-10', 'Pain Relief Suppliers', 'GRN-2024-025', 'IBU-2024-005', 'Regular supply'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 4200, 0.35, 'receipt', '2024-08-15', 'Pain Relief Suppliers', 'GRN-2024-045', 'IBU-2024-008', 'Summer restocking'),

-- ORS receipts
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1500, 0.80, 'receipt', '2024-02-10', 'Rehydration Solutions', 'GRN-2024-010', 'ORS-2024-001', 'Dehydration treatment supply'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1800, 0.80, 'receipt', '2024-06-05', 'Rehydration Solutions', 'GRN-2024-032', 'ORS-2024-006', 'Rainy season preparation'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1600, 0.80, 'receipt', '2024-09-20', 'Rehydration Solutions', 'GRN-2024-058', 'ORS-2024-009', 'Emergency stock update');