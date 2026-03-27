-- =============================================
-- LookKuan POS System - Initial Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'embroidery_staff')),
  pin_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'cashier')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sku_prefix TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);

-- =============================================
-- PRODUCT VARIANTS (color + size combinations)
-- =============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT NOT NULL UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  price_override NUMERIC(12,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_barcode ON product_variants(barcode);

-- =============================================
-- INVENTORY MOVEMENTS (stock history)
-- =============================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receive', 'sell', 'return', 'adjust', 'transfer')),
  quantity_change INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_variant ON inventory_movements(variant_id);
CREATE INDEX idx_movements_type ON inventory_movements(type);
CREATE INDEX idx_movements_created ON inventory_movements(created_at DESC);

-- =============================================
-- CUSTOMERS (CRM)
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  line_id TEXT,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  visit_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers USING gin(name gin_trgm_ops);

-- =============================================
-- CASH SESSIONS (shift management)
-- =============================================
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  opening_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_amount NUMERIC(12,2),
  expected_amount NUMERIC(12,2),
  discrepancy NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_cash_sessions_cashier ON cash_sessions(cashier_id);
CREATE INDEX idx_cash_sessions_status ON cash_sessions(status);

-- =============================================
-- SALES (transactions)
-- =============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number TEXT NOT NULL UNIQUE,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'promptpay', 'credit_card')),
  cash_received NUMERIC(12,2),
  change_amount NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'voided', 'refunded')),
  voided_by UUID REFERENCES profiles(id),
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  note TEXT,
  cash_session_id UUID REFERENCES cash_sessions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_number ON sales(sale_number);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_created ON sales(created_at DESC);
CREATE INDEX idx_sales_session ON sales(cash_session_id);

-- =============================================
-- SALE ITEMS
-- =============================================
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_override NUMERIC(12,2),
  override_approved_by UUID REFERENCES profiles(id),
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_variant ON sale_items(variant_id);

-- =============================================
-- JOB ORDERS (embroidery work orders)
-- =============================================
CREATE TABLE job_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered', 'cancelled')),
  description TEXT NOT NULL,
  design_image_url TEXT,
  garment_type TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  quoted_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  received_by UUID NOT NULL REFERENCES profiles(id),
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_orders_number ON job_orders(order_number);
CREATE INDEX idx_job_orders_status ON job_orders(status);
CREATE INDEX idx_job_orders_customer ON job_orders(customer_phone);
CREATE INDEX idx_job_orders_assigned ON job_orders(assigned_to);

-- =============================================
-- AUDIT LOGS
-- =============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update stock after sale
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.variant_id;

  INSERT INTO inventory_movements (variant_id, type, quantity_change, reference_id, reference_type, created_by)
  SELECT NEW.variant_id, 'sell', -NEW.quantity, NEW.sale_id, 'sale', s.cashier_id
  FROM sales s WHERE s.id = NEW.sale_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sale_item_created
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- Function to restore stock on void
CREATE OR REPLACE FUNCTION restore_stock_on_void()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'voided' AND OLD.status = 'completed' THEN
    UPDATE product_variants pv
    SET stock_quantity = pv.stock_quantity + si.quantity,
        updated_at = NOW()
    FROM sale_items si
    WHERE si.sale_id = NEW.id AND pv.id = si.variant_id;

    INSERT INTO inventory_movements (variant_id, type, quantity_change, reference_id, reference_type, created_by)
    SELECT si.variant_id, 'return', si.quantity, NEW.id, 'void', NEW.voided_by
    FROM sale_items si WHERE si.sale_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sale_voided
  AFTER UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION restore_stock_on_void();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_variants_timestamp BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_job_orders_timestamp BEFORE UPDATE ON job_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: everyone can read active profiles, only admin can modify
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (get_user_role() = 'admin' OR id = auth.uid());

-- Categories: all authenticated can read, admin/manager can modify
CREATE POLICY "Categories viewable by all" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Manager can manage categories" ON categories FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'manager'));

-- Products: all authenticated can read, admin/manager can modify
CREATE POLICY "Products viewable by all" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Manager can manage products" ON products FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'manager'));

-- Product Variants: all authenticated can read, admin/manager can modify
CREATE POLICY "Variants viewable by all" ON product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Manager can manage variants" ON product_variants FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'manager'));

-- Inventory Movements: all authenticated can read, admin/manager can create
CREATE POLICY "Movements viewable by all" ON inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create movements" ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Customers: all authenticated can read and create
CREATE POLICY "Customers viewable by all" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage customers" ON customers FOR ALL TO authenticated USING (true);

-- Cash Sessions: all authenticated can read, owners can modify
CREATE POLICY "Cash sessions viewable by all" ON cash_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create cash sessions" ON cash_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owner or manager can update cash sessions" ON cash_sessions FOR UPDATE TO authenticated USING (cashier_id = auth.uid() OR get_user_role() IN ('admin', 'manager'));

-- Sales: all authenticated can read and create
CREATE POLICY "Sales viewable by all" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create sales" ON sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Manager/Admin can update sales" ON sales FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'manager'));

-- Sale Items: all authenticated can read and create
CREATE POLICY "Sale items viewable by all" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create sale items" ON sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- Job Orders: all authenticated can read, appropriate roles can modify
CREATE POLICY "Job orders viewable by all" ON job_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create job orders" ON job_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Assigned/manager can update job orders" ON job_orders FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid() OR received_by = auth.uid() OR get_user_role() IN ('admin', 'manager')
);

-- Audit Logs: only admin/manager can read, all can create
CREATE POLICY "Admin/Manager can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (get_user_role() IN ('admin', 'manager'));
CREATE POLICY "Authenticated can create audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, sort_order) VALUES
  ('เสื้อ', 1),
  ('กางเกง', 2),
  ('กระโปรง', 3),
  ('ชุดเดรส', 4),
  ('เครื่องประดับ', 5),
  ('อื่นๆ', 6);
