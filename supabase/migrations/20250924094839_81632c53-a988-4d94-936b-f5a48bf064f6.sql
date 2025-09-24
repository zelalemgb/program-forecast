-- Create a facility membership for the current user (admin@moh.com) to facility 1
INSERT INTO user_facility_memberships (user_id, facility_id, status, role)
VALUES ('cb21e044-b10e-4c85-bf5a-2f2227daf417', 1, 'approved', 'facility_user')
ON CONFLICT (user_id, facility_id) 
DO UPDATE SET status = 'approved', role = 'facility_user';

-- Ensure the user has proper role
INSERT INTO user_roles (user_id, role)
VALUES ('cb21e044-b10e-4c85-bf5a-2f2227daf417', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;