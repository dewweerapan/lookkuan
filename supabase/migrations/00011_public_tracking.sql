-- Allow unauthenticated (public) users to read job_orders for the tracking page.
-- Customers only need the order_number to look up their own job — no auth required.
CREATE POLICY "Public can view job orders for tracking"
  ON job_orders FOR SELECT TO anon USING (true);
