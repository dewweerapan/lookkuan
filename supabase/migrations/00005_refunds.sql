-- Refunds table
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_number TEXT NOT NULL UNIQUE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  sale_number TEXT NOT NULL,
  customer_name TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  items JSONB,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_sale ON refunds(sale_id);
CREATE INDEX idx_refunds_created ON refunds(created_at);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Refunds viewable by authenticated" ON refunds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage refunds" ON refunds FOR ALL TO authenticated USING (true);
