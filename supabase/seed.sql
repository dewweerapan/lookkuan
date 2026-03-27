-- =============================================
-- LookKuan POS System - Seed Data
-- =============================================

-- Clear existing seed data (optional, comment out for production)
-- TRUNCATE TABLE products CASCADE;
-- TRUNCATE TABLE customers CASCADE;
-- TRUNCATE TABLE job_orders CASCADE;

-- =============================================
-- PRODUCTS (Thai clothing items with embroidery)
-- =============================================

-- Product 1: เสื้อยืดคอกลม สีขาว
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'เสื้อยืดคอกลม สีขาว',
  'เสื้อยืดคอกลมผ้านุ่มสบายใส่สบาย เหมาะสำหรับพื้นฐานหรือเป็นชั้นในการสวมใส่',
  (SELECT id FROM categories WHERE name = 'เสื้อ'),
  250.00,
  120.00,
  'SKU-001',
  NULL,
  true
);

-- Product 2: เสื้อเชิ้ต แขนยาว
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'เสื้อเชิ้ต แขนยาว',
  'เสื้อเชิ้ตแขนยาวผ้าคอตตอนแท้ มีสไตล์ ใส่ทำงานหรือใส่เที่ยว',
  (SELECT id FROM categories WHERE name = 'เสื้อ'),
  450.00,
  200.00,
  'SKU-002',
  NULL,
  true
);

-- Product 3: กางเกงขายาว ผ้าชิโน
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'กางเกงขายาว ผ้าชิโน',
  'กางเกงชิโนทรงสวย ใส่ทำงาน ใส่เที่ยว หรือใส่บ้าน',
  (SELECT id FROM categories WHERE name = 'กางเกง'),
  650.00,
  300.00,
  'SKU-003',
  NULL,
  true
);

-- Product 4: กางเกงยีนส์ ทรงกระบอก
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'กางเกงยีนส์ ทรงกระบอก',
  'ยีนส์ทรงกระบอก ผ้าดี ใส่สบาย สไตล์ยุโรป',
  (SELECT id FROM categories WHERE name = 'กางเกง'),
  799.00,
  380.00,
  'SKU-004',
  NULL,
  true
);

-- Product 5: กระโปรงสั้น ผ้าพลีท
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'กระโปรงสั้น ผ้าพลีท',
  'กระโปรงพลีท หรูหรา ใส่ได้หลากหลายโอกาส',
  (SELECT id FROM categories WHERE name = 'กระโปรง'),
  550.00,
  250.00,
  'SKU-005',
  NULL,
  true
);

-- Product 6: ชุดเดรส ลายดอก
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'ชุดเดรส ลายดอก',
  'ชุดเดรสสวยๆ ลายดอกแสนสดใส เหมาะสำหรับเทศกาล',
  (SELECT id FROM categories WHERE name = 'ชุดเดรส'),
  1200.00,
  550.00,
  'SKU-006',
  NULL,
  true
);

-- Product 7: เสื้อโปโล สีกรม
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'เสื้อโปโล สีกรม',
  'เสื้อโปโลสีกรมคลาสสิก ใส่ทำงานหรือเล่นกีฬา',
  (SELECT id FROM categories WHERE name = 'เสื้อ'),
  380.00,
  170.00,
  'SKU-007',
  NULL,
  true
);

-- Product 8: เสื้อแจ็คเก็ต หนังPU
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'เสื้อแจ็คเก็ต หนังPU',
  'เสื้อแจ็คเก็ตหนัง เท่ห์ สไตล์ยูโรป ใส่ออกมาดเท่ลงตัว',
  (SELECT id FROM categories WHERE name = 'เสื้อ'),
  1800.00,
  900.00,
  'SKU-008',
  NULL,
  true
);

-- Product 9: กางเกงขาสั้น ผ้าร่ม
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'กางเกงขาสั้น ผ้าร่ม',
  'กางเกงขาสั้นผ้าร่ม สบาย เหมาะสำหรับอากาศร้อน',
  (SELECT id FROM categories WHERE name = 'กางเกง'),
  380.00,
  160.00,
  'SKU-009',
  NULL,
  true
);

-- Product 10: สร้อยคอทอง
INSERT INTO products (
  id, name, description, category_id, base_price, cost_price, sku_prefix, image_url, is_active
) VALUES (
  gen_random_uuid(),
  'สร้อยคอสวยๆ',
  'สร้อยคออลูมิเนียมสวย คงทน ไม่แพ้ง่าย',
  (SELECT id FROM categories WHERE name = 'เครื่องประดับ'),
  450.00,
  180.00,
  'SKU-010',
  NULL,
  true
);

-- =============================================
-- PRODUCT VARIANTS (colors, sizes, stock)
-- =============================================

-- Product 1 variants: เสื้อยืดคอกลม
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ขาว', 'S', 'SKU-001-S-WH', 'BC-001-S-WH', 15, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ขาว', 'M', 'SKU-001-M-WH', 'BC-001-M-WH', 22, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ขาว', 'L', 'SKU-001-L-WH', 'BC-001-L-WH', 18, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ขาว', 'XL', 'SKU-001-XL-WH', 'BC-001-XL-WH', 12, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ดำ', 'M', 'SKU-001-M-BK', 'BC-001-M-BK', 20, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อยืดคอกลม สีขาว' LIMIT 1), 'ดำ', 'L', 'SKU-001-L-BK', 'BC-001-L-BK', 16, 5, true);

-- Product 2 variants: เสื้อเชิ้ต แขนยาว
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อเชิ้ต แขนยาว' LIMIT 1), 'ขาว', 'S', 'SKU-002-S-WH', 'BC-002-S-WH', 12, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อเชิ้ต แขนยาว' LIMIT 1), 'ขาว', 'M', 'SKU-002-M-WH', 'BC-002-M-WH', 18, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อเชิ้ต แขนยาว' LIMIT 1), 'ฟ้า', 'L', 'SKU-002-L-BL', 'BC-002-L-BL', 14, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อเชิ้ต แขนยาว' LIMIT 1), 'ฟ้า', 'XL', 'SKU-002-XL-BL', 'BC-002-XL-BL', 8, 5, true);

-- Product 3 variants: กางเกงขายาว ผ้าชิโน
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขายาว ผ้าชิโน' LIMIT 1), 'เบจ', '28', 'SKU-003-28-BG', 'BC-003-28-BG', 10, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขายาว ผ้าชิโน' LIMIT 1), 'เบจ', '30', 'SKU-003-30-BG', 'BC-003-30-BG', 14, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขายาว ผ้าชิโน' LIMIT 1), 'เบจ', '32', 'SKU-003-32-BG', 'BC-003-32-BG', 16, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขายาว ผ้าชิโน' LIMIT 1), 'ดำ', '30', 'SKU-003-30-BK', 'BC-003-30-BK', 12, 5, true);

-- Product 4 variants: กางเกงยีนส์ ทรงกระบอก
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงยีนส์ ทรงกระบอก' LIMIT 1), 'ฟ้าเข้ม', '28', 'SKU-004-28-DK', 'BC-004-28-DK', 9, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงยีนส์ ทรงกระบอก' LIMIT 1), 'ฟ้าเข้ม', '30', 'SKU-004-30-DK', 'BC-004-30-DK', 13, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงยีนส์ ทรงกระบอก' LIMIT 1), 'ฟ้าเข้ม', '32', 'SKU-004-32-DK', 'BC-004-32-DK', 11, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงยีนส์ ทรงกระบอก' LIMIT 1), 'ฟ้าอ่อน', '30', 'SKU-004-30-LT', 'BC-004-30-LT', 15, 5, true);

-- Product 5 variants: กระโปรงสั้น ผ้าพลีท
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กระโปรงสั้น ผ้าพลีท' LIMIT 1), 'ดำ', 'S', 'SKU-005-S-BK', 'BC-005-S-BK', 17, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กระโปรงสั้น ผ้าพลีท' LIMIT 1), 'ดำ', 'M', 'SKU-005-M-BK', 'BC-005-M-BK', 20, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กระโปรงสั้น ผ้าพลีท' LIMIT 1), 'กรม', 'M', 'SKU-005-M-NV', 'BC-005-M-NV', 14, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กระโปรงสั้น ผ้าพลีท' LIMIT 1), 'กรม', 'L', 'SKU-005-L-NV', 'BC-005-L-NV', 11, 5, true);

-- Product 6 variants: ชุดเดรส ลายดอก
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'ชุดเดรส ลายดอก' LIMIT 1), 'แดง', 'S', 'SKU-006-S-RD', 'BC-006-S-RD', 8, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'ชุดเดรส ลายดอก' LIMIT 1), 'แดง', 'M', 'SKU-006-M-RD', 'BC-006-M-RD', 12, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'ชุดเดรส ลายดอก' LIMIT 1), 'ชมพู', 'S', 'SKU-006-S-PK', 'BC-006-S-PK', 10, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'ชุดเดรส ลายดอก' LIMIT 1), 'ชมพู', 'L', 'SKU-006-L-PK', 'BC-006-L-PK', 6, 5, true);

-- Product 7 variants: เสื้อโปโล สีกรม
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อโปโล สีกรม' LIMIT 1), 'กรม', 'S', 'SKU-007-S-NV', 'BC-007-S-NV', 16, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อโปโล สีกรม' LIMIT 1), 'กรม', 'M', 'SKU-007-M-NV', 'BC-007-M-NV', 22, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อโปโล สีกรม' LIMIT 1), 'กรม', 'L', 'SKU-007-L-NV', 'BC-007-L-NV', 19, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อโปโล สีกรม' LIMIT 1), 'ขาว', 'M', 'SKU-007-M-WH', 'BC-007-M-WH', 14, 5, true);

-- Product 8 variants: เสื้อแจ็คเก็ต หนังPU
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อแจ็คเก็ต หนังPU' LIMIT 1), 'ดำ', 'S', 'SKU-008-S-BK', 'BC-008-S-BK', 5, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อแจ็คเก็ต หนังPU' LIMIT 1), 'ดำ', 'M', 'SKU-008-M-BK', 'BC-008-M-BK', 7, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'เสื้อแจ็คเก็ต หนังPU' LIMIT 1), 'ดำ', 'L', 'SKU-008-L-BK', 'BC-008-L-BK', 4, 5, true);

-- Product 9 variants: กางเกงขาสั้น ผ้าร่ม
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขาสั้น ผ้าร่ม' LIMIT 1), 'ดำ', 'S', 'SKU-009-S-BK', 'BC-009-S-BK', 18, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขาสั้น ผ้าร่ม' LIMIT 1), 'ดำ', 'M', 'SKU-009-M-BK', 'BC-009-M-BK', 24, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขาสั้น ผ้าร่ม' LIMIT 1), 'กรม', 'L', 'SKU-009-L-NV', 'BC-009-L-NV', 15, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'กางเกงขาสั้น ผ้าร่ม' LIMIT 1), 'เทา', 'M', 'SKU-009-M-GR', 'BC-009-M-GR', 11, 5, true);

-- Product 10 variants: สร้อยคอ
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'สร้อยคอสวยๆ' LIMIT 1), 'ทอง', 'One Size', 'SKU-010-OS-GD', 'BC-010-OS-GD', 25, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'สร้อยคอสวยๆ' LIMIT 1), 'เงิน', 'One Size', 'SKU-010-OS-SV', 'BC-010-OS-SV', 18, 5, true),
(gen_random_uuid(), (SELECT id FROM products WHERE name = 'สร้อยคอสวยๆ' LIMIT 1), 'ทองแดง', 'One Size', 'SKU-010-OS-CP', 'BC-010-OS-CP', 20, 5, true);

-- =============================================
-- CUSTOMERS (Thai customers)
-- =============================================

INSERT INTO customers (id, name, phone, email, line_id, total_spent, visit_count, notes) VALUES
(gen_random_uuid(), 'จารี สุนากิจ', '0812345678', 'jaree@example.com', 'jaree.sunakij', 15000.00, 5, 'ลูกค้าประจำ ชอบเสื้อยืด'),
(gen_random_uuid(), 'นัฐนีย์ ตั้งพิศ', '0881234567', 'nattanee.com@example.com', NULL, 8500.00, 3, 'ชอบกระโปรงและชุดเดรส'),
(gen_random_uuid(), 'สมชัย คุณภาสร์', '0864567890', NULL, 'somchai.kp', 12000.00, 4, 'ลูกค้าประจำ ใช้สำหรับบริษัท'),
(gen_random_uuid(), 'พิมพ์ประภา บุคคลธรรม', '0875555555', 'pimpa.b@example.com', 'pimpa.bukit', 5500.00, 2, 'ใหม่มาก ชอบเสื้อเชิ้ต'),
(gen_random_uuid(), 'วิชัย ช่วยชาติ', '0889999999', NULL, 'vichai_chuwwychat', 22000.00, 8, 'ลูกค้าVIP ใช้สำหรับงานแต่งงาน');

-- =============================================
-- JOB ORDERS (Embroidery orders)
-- =============================================

-- Job orders use the first admin profile as received_by
-- Make sure you have at least one user in profiles before running this

INSERT INTO job_orders (
  id, order_number, customer_name, customer_phone, customer_id,
  status, description, design_image_url, garment_type, quantity,
  quoted_price, deposit_amount, balance_due, estimated_completion_date,
  assigned_to, received_by, notes
) VALUES
-- Job Order 1: Pending
(
  gen_random_uuid(),
  'JOB-20260320-001',
  'จารี สุนากิจ',
  '0812345678',
  (SELECT id FROM customers WHERE name = 'จารี สุนากิจ' LIMIT 1),
  'pending',
  'ปักลายมังกรบนเสื้อยืดคอกลมสีขาว ขนาดปัก 10x10 ซม.',
  NULL,
  'เสื้อยืด',
  3,
  1200.00,
  600.00,
  600.00,
  '2026-04-05'::DATE,
  NULL,
  (SELECT id FROM profiles LIMIT 1),
  'ลูกค้าต้องการปักแต่ละตัวแตกต่างกัน'
),
-- Job Order 2: In Progress
(
  gen_random_uuid(),
  'JOB-20260320-002',
  'นัฐนีย์ ตั้งพิศ',
  '0881234567',
  (SELECT id FROM customers WHERE name = 'นัฐนีย์ ตั้งพิศ' LIMIT 1),
  'in_progress',
  'ปักชื่อ "นัฐนีย์" บนเสื้อเชิ้ตแขนยาวสีฟ้า ตัวอักษรสูง 5 ซม.',
  NULL,
  'เสื้อเชิ้ต',
  1,
  800.00,
  800.00,
  0.00,
  '2026-03-28'::DATE,
  NULL,
  (SELECT id FROM profiles LIMIT 1),
  'เสร็จในวันนี้'
),
-- Job Order 3: Completed
(
  gen_random_uuid(),
  'JOB-20260315-003',
  'สมชัย คุณภาสร์',
  '0864567890',
  (SELECT id FROM customers WHERE name = 'สมชัย คุณภาสร์' LIMIT 1),
  'completed',
  'ปักลวดลายดอกไม้แต่งปลายกระโปรงพลีทสีดำ ยาว 2 เมตร',
  NULL,
  'กระโปรง',
  2,
  2500.00,
  2500.00,
  0.00,
  '2026-03-25'::DATE,
  NULL,
  (SELECT id FROM profiles LIMIT 1),
  'เสร็จแล้ว พร้อมส่งมอบ'
);

-- =============================================
-- End of Seed Data
-- =============================================
