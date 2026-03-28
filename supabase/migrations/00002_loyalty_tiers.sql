-- Add loyalty points and tier to customers
-- loyalty_points = 1 point per 100 baht spent
-- tier: bronze < 1000, silver 1000-4999, gold 5000+

ALTER TABLE customers
  ADD COLUMN loyalty_points INTEGER GENERATED ALWAYS AS (FLOOR(total_spent / 100)::INTEGER) STORED,
  ADD COLUMN tier TEXT GENERATED ALWAYS AS (
    CASE
      WHEN total_spent >= 5000 THEN 'gold'
      WHEN total_spent >= 1000 THEN 'silver'
      ELSE 'bronze'
    END
  ) STORED;
