-- Add transactions for Debre Berhan Health Center (facility_id: 2)
INSERT INTO inventory_transactions (
  facility_id, product_id, user_id, quantity, unit_cost, 
  transaction_type, transaction_date, supplier_name, 
  grn_number, batch_number, notes
) VALUES
-- Receipts for Debre Berhan Health Center
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 3000, 0.25, 'receipt', '2024-02-01', 'Regional Medical Supply', 'GRN-2024-101', 'PAR-HC-001', 'Health center monthly supply'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 2800, 0.25, 'receipt', '2024-05-15', 'Regional Medical Supply', 'GRN-2024-125', 'PAR-HC-005', 'Spring stock delivery'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 3200, 0.25, 'receipt', '2024-08-10', 'Regional Medical Supply', 'GRN-2024-150', 'PAR-HC-008', 'Summer restocking'),

(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1500, 1.50, 'receipt', '2024-02-10', 'Health Center Pharmaceuticals', 'GRN-2024-105', 'AMX-HC-001', 'Antibiotic supply for health center'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 1700, 1.50, 'receipt', '2024-06-20', 'Health Center Pharmaceuticals', 'GRN-2024-130', 'AMX-HC-006', 'Mid-year antibiotic delivery'),

(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 800, 0.80, 'receipt', '2024-03-01', 'ORS Direct Supply', 'GRN-2024-110', 'ORS-HC-001', 'ORS for diarrhea treatment'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', 900, 0.80, 'receipt', '2024-07-15', 'ORS Direct Supply', 'GRN-2024-135', 'ORS-HC-007', 'Rainy season preparation');

-- Issues for Debre Berhan Health Center
INSERT INTO inventory_transactions (
  facility_id, product_id, user_id, quantity, unit_cost, 
  transaction_type, transaction_date, department, notes
) VALUES
-- Paracetamol issues
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -280, 0.25, 'issue', '2024-02-15', 'General Outpatient', 'Monthly patient treatment'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -320, 0.25, 'issue', '2024-03-20', 'Maternal Health', 'Post-natal care'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -290, 0.25, 'issue', '2024-04-25', 'General Outpatient', 'Routine dispensing'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -310, 0.25, 'issue', '2024-05-30', 'Pediatric Care', 'Children fever management'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -270, 0.25, 'issue', '2024-06-28', 'General Outpatient', 'Summer health issues'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -340, 0.25, 'issue', '2024-07-30', 'Emergency Care', 'Emergency cases'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -300, 0.25, 'issue', '2024-08-25', 'General Outpatient', 'Regular monthly use'),
(2, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -280, 0.25, 'issue', '2024-09-20', 'Maternal Health', 'End of pregnancy care'),

-- Amoxicillin issues
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -180, 1.50, 'issue', '2024-02-25', 'General Outpatient', 'Respiratory infections'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -220, 1.50, 'issue', '2024-03-30', 'Pediatric Care', 'Children infections'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -190, 1.50, 'issue', '2024-04-28', 'General Outpatient', 'Bacterial infections'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -210, 1.50, 'issue', '2024-05-25', 'Maternal Health', 'Post-delivery infections'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -170, 1.50, 'issue', '2024-06-30', 'General Outpatient', 'Summer infections'),
(2, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -200, 1.50, 'issue', '2024-07-28', 'Emergency Care', 'Emergency antibiotics'),

-- ORS issues
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -90, 0.80, 'issue', '2024-03-15', 'Pediatric Care', 'Diarrhea cases'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -110, 0.80, 'issue', '2024-04-20', 'General Outpatient', 'Dehydration treatment'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -120, 0.80, 'issue', '2024-05-25', 'Emergency Care', 'Emergency rehydration'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -100, 0.80, 'issue', '2024-06-30', 'Pediatric Care', 'Summer diarrhea cases'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -140, 0.80, 'issue', '2024-07-25', 'General Outpatient', 'Rainy season cases'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -130, 0.80, 'issue', '2024-08-20', 'Maternal Health', 'Maternal dehydration'),
(2, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -85, 0.80, 'issue', '2024-09-15', 'Emergency Care', 'Emergency cases');