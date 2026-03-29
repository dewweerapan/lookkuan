-- Allow unauthenticated (anon) users to read products, variants, and categories
-- so the public landing page can display the product catalogue.

CREATE POLICY "Public can view active products"
  ON products FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT TO anon
  USING (true);

CREATE POLICY "Public can view active variants"
  ON product_variants FOR SELECT TO anon
  USING (is_active = true);
