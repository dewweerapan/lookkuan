-- Add shelf_location to product_variants for store map feature
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS shelf_location TEXT;

-- Index for searching by shelf location
CREATE INDEX IF NOT EXISTS idx_product_variants_shelf_location
  ON product_variants(shelf_location)
  WHERE shelf_location IS NOT NULL;
