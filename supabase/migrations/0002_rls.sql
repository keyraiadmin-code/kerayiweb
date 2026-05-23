-- Row Level Security Policies for Keyrai

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ORGANIZATIONS: users can only see their own org
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
  id = get_user_org_id() OR get_user_role() = 'admin'
);

-- PROFILES: users can see profiles in same org
CREATE POLICY "profile_select" ON profiles FOR SELECT USING (
  org_id = get_user_org_id() OR id = auth.uid()
);
CREATE POLICY "profile_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profile_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- PROPERTIES: org-scoped
CREATE POLICY "properties_select" ON properties FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "properties_delete" ON properties FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('admin', 'landlord'));

-- UNITS: org-scoped via property
CREATE POLICY "units_select" ON units FOR SELECT USING (
  property_id IN (SELECT id FROM properties WHERE org_id = get_user_org_id())
);
CREATE POLICY "units_insert" ON units FOR INSERT WITH CHECK (
  property_id IN (SELECT id FROM properties WHERE org_id = get_user_org_id())
);
CREATE POLICY "units_update" ON units FOR UPDATE USING (
  property_id IN (SELECT id FROM properties WHERE org_id = get_user_org_id())
);

-- TENANTS: org-scoped
CREATE POLICY "tenants_select" ON tenants FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "tenants_insert" ON tenants FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "tenants_update" ON tenants FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "tenants_delete" ON tenants FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('admin', 'landlord'));

-- LEASES: org-scoped
CREATE POLICY "leases_select" ON leases FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "leases_insert" ON leases FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "leases_update" ON leases FOR UPDATE USING (org_id = get_user_org_id());

-- PAYMENTS: org-scoped; tenants can see their own
CREATE POLICY "payments_select" ON payments FOR SELECT USING (
  org_id = get_user_org_id() OR
  tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (org_id = get_user_org_id());

-- VENDORS: org-scoped
CREATE POLICY "vendors_select" ON vendors FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "vendors_insert" ON vendors FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "vendors_update" ON vendors FOR UPDATE USING (org_id = get_user_org_id());

-- MAINTENANCE: org-scoped
CREATE POLICY "maintenance_select" ON maintenance_requests FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "maintenance_insert" ON maintenance_requests FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "maintenance_update" ON maintenance_requests FOR UPDATE USING (org_id = get_user_org_id());

-- APPLICATIONS: org-scoped; public insert allowed for marketplace
CREATE POLICY "applications_select" ON applications FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "applications_insert" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "applications_update" ON applications FOR UPDATE USING (org_id = get_user_org_id());

-- LISTINGS: org-scoped for manage; public read for active
CREATE POLICY "listings_public_select" ON listings FOR SELECT USING (status = 'active' OR org_id = get_user_org_id());
CREATE POLICY "listings_insert" ON listings FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "listings_update" ON listings FOR UPDATE USING (org_id = get_user_org_id());

-- DOCUMENTS: org-scoped
CREATE POLICY "documents_select" ON documents FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- MESSAGE THREADS: org-scoped
CREATE POLICY "threads_select" ON message_threads FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "threads_insert" ON message_threads FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- MESSAGES: via thread's org
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  thread_id IN (SELECT id FROM message_threads WHERE org_id = get_user_org_id())
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  thread_id IN (SELECT id FROM message_threads WHERE org_id = get_user_org_id())
);

-- Payments verify by receipt_number (public — for QR code scanning)
CREATE POLICY "payments_verify_public" ON payments FOR SELECT USING (
  receipt_number IS NOT NULL AND status = 'approved'
);
