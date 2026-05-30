-- Keyrai Seed Data
-- Test organization and sample data for development

-- Organization: Selam Realty
INSERT INTO organizations (id, name, slug, plan, email, phone, address)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Selam Realty',
  'selam-realty',
  'pro',
  'info@selamrealty.et',
  '+251 11 234 5678',
  'Bole Sub-City, Addis Ababa'
) ON CONFLICT (id) DO NOTHING;

-- Sample properties
INSERT INTO properties (id, org_id, owner_id, name, address, city, type, total_units, description)
SELECT
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000010',
  (SELECT id FROM profiles LIMIT 1),
  'Bole Heights',
  'Bole Road, House 245',
  'Addis Ababa',
  'residential',
  12,
  'Modern residential apartment building in Bole'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = '00000000-0000-0000-0000-000000000100');

INSERT INTO properties (id, org_id, owner_id, name, address, city, type, total_units, description)
SELECT
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000010',
  (SELECT id FROM profiles LIMIT 1),
  'Kazanchis Plaza',
  'Kazanchis, Behind National Bank',
  'Addis Ababa',
  'commercial',
  6,
  'Commercial office building in Kazanchis'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = '00000000-0000-0000-0000-000000000101');

-- Sample units for Bole Heights
INSERT INTO units (property_id, unit_number, floor, bedrooms, bathrooms, size_sqm, rent_amount, status)
VALUES
  ('00000000-0000-0000-0000-000000000100', '101', 1, 2, 1, 75, 15000, 'occupied'),
  ('00000000-0000-0000-0000-000000000100', '102', 1, 1, 1, 55, 12000, 'vacant'),
  ('00000000-0000-0000-0000-000000000100', '201', 2, 3, 2, 110, 22000, 'occupied'),
  ('00000000-0000-0000-0000-000000000100', '202', 2, 2, 1, 80, 18000, 'vacant'),
  ('00000000-0000-0000-0000-000000000100', '301', 3, 2, 1, 75, 15500, 'maintenance')
ON CONFLICT DO NOTHING;

-- Sample tenants
INSERT INTO tenants (id, org_id, full_name, email, phone, trust_score, id_verified)
VALUES
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000010', 'Abebe Kebede', 'abebe@example.com', '+251 91 234 5678', 82, true),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000010', 'Tigist Haile', 'tigist@example.com', '+251 92 345 6789', 65, false),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000010', 'Yonas Tesfaye', 'yonas@example.com', '+251 93 456 7890', 91, true)
ON CONFLICT (id) DO NOTHING;

-- Sample vendors
INSERT INTO vendors (org_id, name, category, phone, rating, active)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Abiy Plumbing', 'plumbing', '+251 91 111 2222', 4, true),
  ('00000000-0000-0000-0000-000000000010', 'Selam Electric', 'electrical', '+251 91 333 4444', 5, true),
  ('00000000-0000-0000-0000-000000000010', 'Addis Painters', 'painting', '+251 91 555 6666', 3, true)
ON CONFLICT DO NOTHING;
