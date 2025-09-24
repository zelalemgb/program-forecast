-- Issue transactions (stock out) for Tikur Anbessa Hospital
INSERT INTO inventory_transactions (
  facility_id, product_id, user_id, quantity, unit_cost, 
  transaction_type, transaction_date, department, notes
) VALUES
-- Paracetamol issues over the year
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -450, 0.25, 'issue', '2024-01-20', 'Emergency Ward', 'Patient treatment supplies'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -380, 0.25, 'issue', '2024-02-15', 'General Medicine', 'Monthly ward allocation'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -520, 0.25, 'issue', '2024-03-20', 'Pediatric Ward', 'Pediatric pain management'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -410, 0.25, 'issue', '2024-04-25', 'Outpatient Department', 'Outpatient prescriptions'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -490, 0.25, 'issue', '2024-05-30', 'Emergency Ward', 'Emergency department use'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -470, 0.25, 'issue', '2024-06-28', 'General Medicine', 'Regular ward dispensing'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -390, 0.25, 'issue', '2024-07-25', 'ICU', 'Intensive care unit'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -530, 0.25, 'issue', '2024-08-20', 'Pediatric Ward', 'High fever cases'),
(1, 'c60624dd-03d8-40f2-863c-98c11e15f92d', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -440, 0.25, 'issue', '2024-09-22', 'Emergency Ward', 'Trauma cases'),

-- Amoxicillin issues
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -280, 1.50, 'issue', '2024-01-25', 'General Medicine', 'Respiratory infections'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -320, 1.50, 'issue', '2024-02-28', 'Pediatric Ward', 'Pediatric infections'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -290, 1.50, 'issue', '2024-03-30', 'Outpatient Department', 'Outpatient antibiotics'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -310, 1.50, 'issue', '2024-04-28', 'Emergency Ward', 'Emergency infections'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -270, 1.50, 'issue', '2024-05-25', 'General Medicine', 'Bacterial infections'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -340, 1.50, 'issue', '2024-06-30', 'Pediatric Ward', 'Summer infections'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -300, 1.50, 'issue', '2024-07-28', 'Outpatient Department', 'Monthly dispensing'),
(1, '908a1d6d-be84-4952-be20-e5547b994aa1', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -285, 1.50, 'issue', '2024-08-30', 'General Medicine', 'Routine treatments'),

-- Metformin issues
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -180, 2.75, 'issue', '2024-02-10', 'Diabetes Clinic', 'Diabetes management'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -220, 2.75, 'issue', '2024-03-15', 'Outpatient Department', 'Chronic disease management'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -190, 2.75, 'issue', '2024-04-20', 'General Medicine', 'Diabetes follow-up'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -210, 2.75, 'issue', '2024-05-25', 'Diabetes Clinic', 'Regular monthly supply'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -200, 2.75, 'issue', '2024-06-28', 'Outpatient Department', 'Preventive care'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -170, 2.75, 'issue', '2024-07-30', 'General Medicine', 'Patient refills'),
(1, '59c96ea1-e837-4c36-97d2-6b657390f9a7', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -195, 2.75, 'issue', '2024-08-28', 'Diabetes Clinic', 'End of summer supply'),

-- Ibuprofen issues
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -350, 0.35, 'issue', '2024-02-05', 'Emergency Ward', 'Pain management'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -320, 0.35, 'issue', '2024-03-10', 'Orthopedic Ward', 'Post-surgery pain relief'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -380, 0.35, 'issue', '2024-04-15', 'General Medicine', 'Inflammatory conditions'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -290, 0.35, 'issue', '2024-05-20', 'Emergency Ward', 'Trauma pain management'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -340, 0.35, 'issue', '2024-06-25', 'Outpatient Department', 'Chronic pain cases'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -310, 0.35, 'issue', '2024-07-20', 'Orthopedic Ward', 'Recovery treatments'),
(1, '19de1a6b-08f9-4bd9-ac6a-f91993e41983', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -360, 0.35, 'issue', '2024-08-25', 'General Medicine', 'Summer activities injuries'),

-- ORS issues
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -120, 0.80, 'issue', '2024-02-20', 'Pediatric Ward', 'Diarrhea treatment'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -150, 0.80, 'issue', '2024-03-25', 'Emergency Ward', 'Dehydration cases'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -110, 0.80, 'issue', '2024-04-30', 'Outpatient Department', 'Gastroenteritis treatment'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -140, 0.80, 'issue', '2024-05-28', 'Pediatric Ward', 'Seasonal diarrhea cases'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -180, 0.80, 'issue', '2024-06-30', 'Emergency Ward', 'Rainy season preparations'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -160, 0.80, 'issue', '2024-07-25', 'General Medicine', 'Monsoon health issues'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -130, 0.80, 'issue', '2024-08-28', 'Pediatric Ward', 'Late summer cases'),
(1, '6c7022d8-05ee-499d-9fb3-dd5e8f843131', 'cb21e044-b10e-4c85-bf5a-2f2227daf417', -170, 0.80, 'issue', '2024-09-25', 'Emergency Ward', 'End of season spike');