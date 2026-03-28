-- Installment Plans
CREATE TABLE installment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  down_payment NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - down_payment) STORED,
  num_installments INTEGER NOT NULL DEFAULT 3,
  interval_days INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installment Payments (schedule)
CREATE TABLE installment_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES installment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_installment_plans_customer ON installment_plans(customer_phone);
CREATE INDEX idx_installment_plans_status ON installment_plans(status);
CREATE INDEX idx_installment_payments_plan ON installment_payments(plan_id);
CREATE INDEX idx_installment_payments_due ON installment_payments(due_date);

CREATE TRIGGER update_installment_plans_timestamp
  BEFORE UPDATE ON installment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Installment plans viewable by authenticated" ON installment_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage installment plans" ON installment_plans
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Installment payments viewable by authenticated" ON installment_payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage installment payments" ON installment_payments
  FOR ALL TO authenticated USING (true);
