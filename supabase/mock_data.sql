-- =============================================
-- LookKuan - Complete Mock Data (Reset + Seed)
-- รันหลังจาก TRUNCATE ตารางทั้งหมดแล้ว
-- =============================================

-- =============================================
-- 1. CATEGORIES
-- =============================================
INSERT INTO categories (id, name, sort_order, is_active) VALUES
(gen_random_uuid(), 'เสื้อ',          1, true),
(gen_random_uuid(), 'กางเกง',         2, true),
(gen_random_uuid(), 'กระโปรง',        3, true),
(gen_random_uuid(), 'ชุดเดรส',        4, true),
(gen_random_uuid(), 'เครื่องประดับ',  5, true);

-- =============================================
-- 2. PRODUCTS
-- =============================================
INSERT INTO products (id, name, description, category_id, base_price, cost_price, sku_prefix, is_active) VALUES
(gen_random_uuid(), 'เสื้อยืดคอกลม สีขาว',   'เสื้อยืดคอกลมผ้านุ่มสบาย',                    (SELECT id FROM categories WHERE name='เสื้อ'),         250.00, 120.00, 'SKU-001', true),
(gen_random_uuid(), 'เสื้อเชิ้ต แขนยาว',      'เสื้อเชิ้ตแขนยาวผ้าคอตตอนแท้',               (SELECT id FROM categories WHERE name='เสื้อ'),         450.00, 200.00, 'SKU-002', true),
(gen_random_uuid(), 'กางเกงขายาว ผ้าชิโน',    'กางเกงชิโนทรงสวย ใส่ทำงานหรือเที่ยว',         (SELECT id FROM categories WHERE name='กางเกง'),        650.00, 300.00, 'SKU-003', true),
(gen_random_uuid(), 'กางเกงยีนส์ ทรงกระบอก',  'ยีนส์ทรงกระบอก ผ้าดี ใส่สบาย',               (SELECT id FROM categories WHERE name='กางเกง'),        799.00, 380.00, 'SKU-004', true),
(gen_random_uuid(), 'กระโปรงสั้น ผ้าพลีท',    'กระโปรงพลีท หรูหรา ใส่ได้หลายโอกาส',          (SELECT id FROM categories WHERE name='กระโปรง'),       550.00, 250.00, 'SKU-005', true),
(gen_random_uuid(), 'ชุดเดรส ลายดอก',         'ชุดเดรสสวยๆ ลายดอกแสนสดใส',                  (SELECT id FROM categories WHERE name='ชุดเดรส'),       1200.00,550.00, 'SKU-006', true),
(gen_random_uuid(), 'เสื้อโปโล สีกรม',        'เสื้อโปโลสีกรมคลาสสิก ใส่ทำงานหรือเล่นกีฬา', (SELECT id FROM categories WHERE name='เสื้อ'),         380.00, 170.00, 'SKU-007', true),
(gen_random_uuid(), 'เสื้อแจ็คเก็ต หนังPU',   'เสื้อแจ็คเก็ตหนัง เท่ห์ สไตล์ยุโรป',         (SELECT id FROM categories WHERE name='เสื้อ'),         1800.00,900.00, 'SKU-008', true),
(gen_random_uuid(), 'กางเกงขาสั้น ผ้าร่ม',    'กางเกงขาสั้นผ้าร่ม สบาย เหมาะอากาศร้อน',      (SELECT id FROM categories WHERE name='กางเกง'),        380.00, 160.00, 'SKU-009', true),
(gen_random_uuid(), 'สร้อยคอสวยๆ',            'สร้อยคออลูมิเนียม คงทน ไม่แพ้ง่าย',           (SELECT id FROM categories WHERE name='เครื่องประดับ'), 450.00, 180.00, 'SKU-010', true);

-- =============================================
-- 3. PRODUCT VARIANTS
-- =============================================
INSERT INTO product_variants (id, product_id, color, size, sku, barcode, stock_quantity, low_stock_threshold, is_active) VALUES
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ขาว','S', 'SKU-001-S-WH', 'BC-001-S-WH',15,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ขาว','M', 'SKU-001-M-WH', 'BC-001-M-WH',22,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ขาว','L', 'SKU-001-L-WH', 'BC-001-L-WH',18,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ขาว','XL','SKU-001-XL-WH','BC-001-XL-WH',12,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ดำ', 'M', 'SKU-001-M-BK', 'BC-001-M-BK',20,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-001'),'ดำ', 'L', 'SKU-001-L-BK', 'BC-001-L-BK',16,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-002'),'ขาว','S', 'SKU-002-S-WH', 'BC-002-S-WH',12,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-002'),'ขาว','M', 'SKU-002-M-WH', 'BC-002-M-WH',18,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-002'),'ฟ้า','L', 'SKU-002-L-BL', 'BC-002-L-BL',14,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-002'),'ฟ้า','XL','SKU-002-XL-BL','BC-002-XL-BL', 8,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-003'),'เบจ','28','SKU-003-28-BG','BC-003-28-BG',10,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-003'),'เบจ','30','SKU-003-30-BG','BC-003-30-BG',14,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-003'),'เบจ','32','SKU-003-32-BG','BC-003-32-BG',16,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-003'),'ดำ', '30','SKU-003-30-BK','BC-003-30-BK',12,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-004'),'ฟ้าเข้ม','28','SKU-004-28-DK','BC-004-28-DK', 9,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-004'),'ฟ้าเข้ม','30','SKU-004-30-DK','BC-004-30-DK',13,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-004'),'ฟ้าเข้ม','32','SKU-004-32-DK','BC-004-32-DK',11,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-004'),'ฟ้าอ่อน','30','SKU-004-30-LT','BC-004-30-LT',15,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-005'),'ดำ', 'S','SKU-005-S-BK','BC-005-S-BK',17,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-005'),'ดำ', 'M','SKU-005-M-BK','BC-005-M-BK',20,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-005'),'กรม','M','SKU-005-M-NV','BC-005-M-NV',14,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-005'),'กรม','L','SKU-005-L-NV','BC-005-L-NV',11,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-006'),'แดง', 'S','SKU-006-S-RD','BC-006-S-RD', 8,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-006'),'แดง', 'M','SKU-006-M-RD','BC-006-M-RD',12,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-006'),'ชมพู','S','SKU-006-S-PK','BC-006-S-PK',10,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-006'),'ชมพู','L','SKU-006-L-PK','BC-006-L-PK', 6,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-007'),'กรม','S', 'SKU-007-S-NV','BC-007-S-NV',16,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-007'),'กรม','M', 'SKU-007-M-NV','BC-007-M-NV',22,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-007'),'กรม','L', 'SKU-007-L-NV','BC-007-L-NV',19,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-007'),'ขาว','M', 'SKU-007-M-WH','BC-007-M-WH',14,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-008'),'ดำ','S','SKU-008-S-BK','BC-008-S-BK',5,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-008'),'ดำ','M','SKU-008-M-BK','BC-008-M-BK',7,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-008'),'ดำ','L','SKU-008-L-BK','BC-008-L-BK',4,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-009'),'ดำ', 'S','SKU-009-S-BK','BC-009-S-BK',18,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-009'),'ดำ', 'M','SKU-009-M-BK','BC-009-M-BK',24,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-009'),'กรม','L','SKU-009-L-NV','BC-009-L-NV',15,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-009'),'เทา','M','SKU-009-M-GR','BC-009-M-GR',11,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-010'),'ทอง',   'One Size','SKU-010-OS-GD','BC-010-OS-GD',25,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-010'),'เงิน',  'One Size','SKU-010-OS-SV','BC-010-OS-SV',18,5,true),
(gen_random_uuid(),(SELECT id FROM products WHERE sku_prefix='SKU-010'),'ทองแดง','One Size','SKU-010-OS-CP','BC-010-OS-CP',20,5,true);

-- =============================================
-- 4. CUSTOMERS (15 คน)
-- =============================================
INSERT INTO customers (id, name, phone, email, line_id, total_spent, visit_count, notes) VALUES
(gen_random_uuid(),'จารี สุนากิจ',        '0812345678','jaree@example.com',     'jaree.sunakij', 15000.00, 5,'ลูกค้าประจำ ชอบเสื้อยืด'),
(gen_random_uuid(),'นัฐนีย์ ตั้งพิศ',     '0881234567','nattanee@example.com',  NULL,             8500.00, 3,'ชอบกระโปรงและชุดเดรส'),
(gen_random_uuid(),'สมชัย คุณภาสร์',      '0864567890',NULL,                    'somchai.kp',    12000.00, 4,'ลูกค้าประจำ ใช้สำหรับบริษัท'),
(gen_random_uuid(),'พิมพ์ประภา บุคคลธรรม','0875555556','pimpa.b@example.com',   'pimpa.bukit',    5500.00, 2,'ชอบเสื้อเชิ้ต'),
(gen_random_uuid(),'วิชัย ช่วยชาติ',       '0889999999',NULL,                   'vichai_c',      22000.00, 8,'ลูกค้า VIP ใช้สำหรับงานแต่งงาน'),
(gen_random_uuid(),'มาลี สุขใจ',           '0811111111','malee@example.com',    'malee_s',       31500.00,12,'ลูกค้า VIP ซื้อเยอะมาก มักมาช่วงเย็น'),
(gen_random_uuid(),'ประยุทธ วงศ์ดี',       '0822222222',NULL,                   'prayut_w',       9200.00, 4,'ซื้อเป็นของฝาก ชอบเสื้อโปโล'),
(gen_random_uuid(),'สุภาพร แสนดี',         '0833333333','supaporn@example.com', NULL,            18700.00, 7,'ชอบลดราคา'),
(gen_random_uuid(),'อรุณ ใจดี',            '0844444444',NULL,                   'aroon.jaidee',   4500.00, 2,'ซื้อครั้งแรก ชวนเพื่อนมาด้วย'),
(gen_random_uuid(),'กาญจนา ทองคำ',         '0855555555','kanjana@example.com',  'kanjana_t',     27000.00, 9,'สั่งปักชื่อบริษัทประจำ'),
(gen_random_uuid(),'ธนา พรหมสาคร',         '0866666666',NULL,                   NULL,             6300.00, 3,'พนักงานออฟฟิศ ชอบเชิ้ต'),
(gen_random_uuid(),'วิภา ศรีสวัสดิ์',      '0877777777','wipa@example.com',     'wipa_ss',       14200.00, 6,'ซื้อทุกเดือน ชอบชุดเดรส'),
(gen_random_uuid(),'บุญมี รักดี',           '0888888881',NULL,                   'boonmee_r',      3200.00, 1,'ลูกค้าใหม่'),
(gen_random_uuid(),'ชนาภา โกศล',           '0899999998','chanapa@example.com',  NULL,            22100.00, 8,'สั่งงานปักสม่ำเสมอ'),
(gen_random_uuid(),'ศักดิ์ชัย บุญรักษ์',   '0800000001',NULL,                  'sakchai_b',      7800.00, 3,'ซื้อให้ภรรยา');

-- =============================================
-- 5. JOB ORDERS (15 งาน ย้อนหลัง 3 เดือน)
-- =============================================
INSERT INTO job_orders (
  id, order_number, customer_name, customer_phone, customer_id,
  status, description, garment_type, quantity,
  quoted_price, deposit_amount, balance_due,
  estimated_completion_date, actual_completion_date,
  received_by, notes, created_at
) VALUES
(gen_random_uuid(),'JOB-20260105-001','มาลี สุขใจ','0811111111',
 (SELECT id FROM customers WHERE phone='0811111111' LIMIT 1),
 'delivered','ปักโลโก้บริษัท ABC บนเสื้อโปโล 20 ตัว','เสื้อโปโล',20,
 6000.00,3000.00,0.00,'2026-01-15','2026-01-14',
 (SELECT id FROM profiles LIMIT 1),'ส่งครบแล้ว ลูกค้าพอใจมาก','2026-01-05 09:30:00+07'),

(gen_random_uuid(),'JOB-20260110-002','กาญจนา ทองคำ','0855555555',
 (SELECT id FROM customers WHERE phone='0855555555' LIMIT 1),
 'delivered','ปักชื่อ "KT Group" บนหมวก Cap 50 ใบ','หมวก',50,
 7500.00,7500.00,0.00,'2026-01-20','2026-01-18',
 (SELECT id FROM profiles LIMIT 1),'ครบตามกำหนด','2026-01-10 10:00:00+07'),

(gen_random_uuid(),'JOB-20260115-003','ชนาภา โกศล','0899999998',
 (SELECT id FROM customers WHERE phone='0899999998' LIMIT 1),
 'delivered','ปักดอกกุหลาบบนเสื้อยืดสีขาว 5 ตัว','เสื้อยืด',5,
 2500.00,1500.00,0.00,'2026-01-22','2026-01-21',
 (SELECT id FROM profiles LIMIT 1),NULL,'2026-01-15 14:00:00+07'),

(gen_random_uuid(),'JOB-20260201-004','สมชัย คุณภาสร์','0864567890',
 (SELECT id FROM customers WHERE phone='0864567890' LIMIT 1),
 'delivered','ปักชื่อองค์กร "SCK" บนเสื้อแจ็คเก็ต 10 ตัว','เสื้อแจ็คเก็ต',10,
 8000.00,4000.00,0.00,'2026-02-10','2026-02-09',
 (SELECT id FROM profiles LIMIT 1),'เสร็จก่อนกำหนด','2026-02-01 09:00:00+07'),

(gen_random_uuid(),'JOB-20260210-005','วิภา ศรีสวัสดิ์','0877777777',
 (SELECT id FROM customers WHERE phone='0877777777' LIMIT 1),
 'delivered','ปักชื่อ "Wipa" อักษรวิจิตรบนชุดเดรสสีชมพู','ชุดเดรส',1,
 1200.00,600.00,0.00,'2026-02-14','2026-02-13',
 (SELECT id FROM profiles LIMIT 1),'วันวาเลนไทน์','2026-02-10 11:00:00+07'),

(gen_random_uuid(),'JOB-20260215-006','จารี สุนากิจ','0812345678',
 (SELECT id FROM customers WHERE phone='0812345678' LIMIT 1),
 'delivered','ปักรูปแมวน้อยบนเสื้อยืด 3 ตัว','เสื้อยืด',3,
 1800.00,900.00,0.00,'2026-02-20','2026-02-19',
 (SELECT id FROM profiles LIMIT 1),NULL,'2026-02-15 13:30:00+07'),

(gen_random_uuid(),'JOB-20260220-007','ธนา พรหมสาคร','0866666666',
 (SELECT id FROM customers WHERE phone='0866666666' LIMIT 1),
 'delivered','ปักชื่อแผนก HR บนเสื้อเชิ้ต 8 ตัว','เสื้อเชิ้ต',8,
 3200.00,3200.00,0.00,'2026-02-28','2026-02-27',
 (SELECT id FROM profiles LIMIT 1),'จ่ายเต็มจำนวน','2026-02-20 10:00:00+07'),

(gen_random_uuid(),'JOB-20260301-008','กาญจนา ทองคำ','0855555555',
 (SELECT id FROM customers WHERE phone='0855555555' LIMIT 1),
 'delivered','ปักโลโก้ใหม่บริษัทบนเสื้อโปโล 30 ตัว','เสื้อโปโล',30,
 9000.00,4500.00,0.00,'2026-03-10','2026-03-09',
 (SELECT id FROM profiles LIMIT 1),'ออเดอร์ใหญ่ประจำไตรมาส','2026-03-01 09:00:00+07'),

(gen_random_uuid(),'JOB-20260305-009','ชนาภา โกศล','0899999998',
 (SELECT id FROM customers WHERE phone='0899999998' LIMIT 1),
 'completed','ปักรูปพระอาทิตย์บนกระโปรงยาว 2 ตัว เสร็จแล้วรอลูกค้ามารับ','กระโปรง',2,
 2400.00,1200.00,1200.00,'2026-03-15',NULL,
 (SELECT id FROM profiles LIMIT 1),'รอลูกค้ามารับและชำระส่วนที่เหลือ','2026-03-05 14:00:00+07'),

(gen_random_uuid(),'JOB-20260310-010','มาลี สุขใจ','0811111111',
 (SELECT id FROM customers WHERE phone='0811111111' LIMIT 1),
 'in_progress','ปักชื่อ "Mali" สไตล์ vintage บนเสื้อยืด 2 ตัว','เสื้อยืด',2,
 1600.00,800.00,800.00,'2026-03-30',NULL,
 (SELECT id FROM profiles LIMIT 1),'กำลังดำเนินการ','2026-03-10 11:00:00+07'),

(gen_random_uuid(),'JOB-20260312-011','สุภาพร แสนดี','0833333333',
 (SELECT id FROM customers WHERE phone='0833333333' LIMIT 1),
 'in_progress','ปักลายดาวและเดือนบนหมวก 3 ใบ สีเงิน','หมวก',3,
 1800.00,900.00,900.00,'2026-03-28',NULL,
 (SELECT id FROM profiles LIMIT 1),NULL,'2026-03-12 10:30:00+07'),

(gen_random_uuid(),'JOB-20260318-012','วิชัย ช่วยชาติ','0889999999',
 (SELECT id FROM customers WHERE phone='0889999999' LIMIT 1),
 'pending','ปักชื่อ "V.C." บนเสื้อเชิ้ตผ้าซาติน 2 ตัว','เสื้อเชิ้ต',2,
 2000.00,1000.00,1000.00,'2026-04-05',NULL,
 (SELECT id FROM profiles LIMIT 1),'รอรับตัวเสื้อจากลูกค้า','2026-03-18 09:00:00+07'),

(gen_random_uuid(),'JOB-20260320-013','อรุณ ใจดี','0844444444',
 (SELECT id FROM customers WHERE phone='0844444444' LIMIT 1),
 'pending','ปักชื่อ "Aroon" ด้วยด้ายสีทองบนเสื้อสูท','เสื้อสูท',1,
 1500.00,750.00,750.00,'2026-04-10',NULL,
 (SELECT id FROM profiles LIMIT 1),'รับเสื้อมาแล้ว รอลงมือปัก','2026-03-20 15:00:00+07'),

(gen_random_uuid(),'JOB-20260325-014','ประยุทธ วงศ์ดี','0822222222',
 (SELECT id FROM customers WHERE phone='0822222222' LIMIT 1),
 'pending','ปักชื่อทีม "Dragon FC" บนเสื้อกีฬา 11 ตัว','เสื้อกีฬา',11,
 5500.00,2750.00,2750.00,'2026-04-15',NULL,
 (SELECT id FROM profiles LIMIT 1),'สีต่างกันทุกตัว','2026-03-25 10:00:00+07'),

(gen_random_uuid(),'JOB-20260327-015','นัฐนีย์ ตั้งพิศ','0881234567',
 (SELECT id FROM customers WHERE phone='0881234567' LIMIT 1),
 'pending','ปักชื่อ "Nattanee" สไตล์เกาหลีบนเสื้อสเวตเตอร์','เสื้อสเวตเตอร์',1,
 900.00,450.00,450.00,'2026-04-08',NULL,
 (SELECT id FROM profiles LIMIT 1),'ลูกค้าโทรมาถามบ่อย','2026-03-27 14:30:00+07');

-- =============================================
-- 6. SALES + SALE_ITEMS (29 บิล)
-- =============================================
DO $$
DECLARE
  v_cashier_id uuid;
  v_sale_id uuid;
  v_v1 uuid; v_v2 uuid; v_v3 uuid; v_v4 uuid; v_v5 uuid;
BEGIN
  SELECT id INTO v_cashier_id FROM profiles LIMIT 1;
  SELECT id INTO v_v1 FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1;
  SELECT id INTO v_v2 FROM product_variants WHERE sku='SKU-002-L-BL' LIMIT 1;
  SELECT id INTO v_v3 FROM product_variants WHERE sku='SKU-003-30-BG' LIMIT 1;
  SELECT id INTO v_v4 FROM product_variants WHERE sku='SKU-007-M-NV' LIMIT 1;
  SELECT id INTO v_v5 FROM product_variants WHERE sku='SKU-009-M-BK' LIMIT 1;

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260103-0001',v_cashier_id,1010,0,0,1010,'cash',1100,90,'completed','2026-01-03 10:15:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / M',1,250,0,250),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',1,380,0,380),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260105-0002',v_cashier_id,1100,0,0,1100,'transfer','completed','2026-01-05 14:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ฟ้า / L',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 30',1,650,0,650);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260108-0003',v_cashier_id,500,0,0,500,'cash',500,0,'completed','2026-01-08 11:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / M',2,250,0,500);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260112-0004',v_cashier_id,2600,200,0,2400,'promptpay','completed','2026-01-12 16:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 30',2,650,100,1200),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',2,380,50,710),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,50,330);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260115-0005',v_cashier_id,830,0,0,830,'cash',1000,170,'completed','2026-01-15 10:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ฟ้า / L',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260118-0006',v_cashier_id,3040,0,0,3040,'credit_card','completed','2026-01-18 13:45:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / L',4,250,0,1000),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',4,380,0,1520),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260122-0007',v_cashier_id,1100,0,0,1100,'cash',1100,0,'completed','2026-01-22 09:20:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / M',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','ดำ / 30',1,650,0,650);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,void_reason,created_at)
  VALUES(gen_random_uuid(),'SALE-20260125-0008',v_cashier_id,250,0,0,250,'cash',500,250,'voided','ลูกค้าเปลี่ยนใจ','2026-01-25 15:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / S',1,250,0,250);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260128-0009',v_cashier_id,760,0,0,760,'transfer','completed','2026-01-28 17:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / S',2,380,0,760);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260201-0010',v_cashier_id,1480,0,0,1480,'cash',1500,20,'completed','2026-02-01 10:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / S',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 28',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','เทา / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260205-0011',v_cashier_id,1140,0,0,1140,'promptpay','completed','2026-02-05 14:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ดำ / L',2,250,0,500),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','ขาว / M',1,380,0,380),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','กรม / L',1,380,120,260);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260208-0012',v_cashier_id,2150,0,0,2150,'cash',2200,50,'completed','2026-02-08 11:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 32',2,650,0,1300),
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ฟ้า / XL',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / L',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260212-0013',v_cashier_id,500,0,0,500,'transfer','completed','2026-02-12 16:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / XL',2,250,0,500);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260214-0014',v_cashier_id,830,100,0,730,'cash',800,70,'completed','2026-02-14 12:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / M',1,450,100,350),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','กรม / L',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260218-0015',v_cashier_id,3040,0,0,3040,'credit_card','completed','2026-02-18 15:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ดำ / M',4,250,0,1000),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',4,380,0,1520),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',2,380,0,760);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,void_reason,created_at)
  VALUES(gen_random_uuid(),'SALE-20260220-0016',v_cashier_id,650,0,0,650,'cash',1000,350,'voided','บันทึกผิด สินค้าไม่มีในสต็อก','2026-02-20 10:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','ดำ / 32',1,650,0,650);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260222-0017',v_cashier_id,1480,0,0,1480,'cash',1500,20,'completed','2026-02-22 09:45:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 30',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / S',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260225-0018',v_cashier_id,760,0,0,760,'promptpay','completed','2026-02-25 13:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / S',2,380,0,760);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260301-0019',v_cashier_id,1950,0,0,1950,'cash',2000,50,'completed','2026-03-01 10:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / M',2,450,0,900),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 30',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260305-0020',v_cashier_id,1520,0,0,1520,'transfer','completed','2026-03-05 14:15:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / L',3,250,0,750),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / L',2,380,10,750);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260308-0021',v_cashier_id,2550,0,0,2550,'cash',3000,450,'completed','2026-03-08 11:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','ดำ / 30',2,650,0,1300),
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ฟ้า / L',2,450,0,900),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','เทา / M',1,380,30,350);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260310-0022',v_cashier_id,630,0,0,630,'promptpay','completed','2026-03-10 16:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ดำ / M',1,250,0,250),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / S',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260312-0023',v_cashier_id,1680,0,0,1680,'cash',2000,320,'completed','2026-03-12 10:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / M',2,450,0,900),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 28',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','ขาว / M',1,380,250,130);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260315-0024',v_cashier_id,1900,200,0,1700,'credit_card','completed','2026-03-15 14:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / M',2,250,50,450),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 32',1,650,100,550),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',1,380,50,330),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260318-0025',v_cashier_id,630,0,0,630,'cash',700,70,'completed','2026-03-18 09:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / S',1,250,0,250),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','กรม / L',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,void_reason,created_at)
  VALUES(gen_random_uuid(),'SALE-20260320-0026',v_cashier_id,380,0,0,380,'cash',500,120,'voided','ลูกค้ายกเลิก ของหมด','2026-03-20 11:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / L',1,380,0,380);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260322-0027',v_cashier_id,2290,0,0,2290,'transfer','completed','2026-03-22 13:00:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ฟ้า / XL',2,450,0,900),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','ดำ / 30',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v4,'เสื้อโปโล สีกรม','กรม / M',2,380,40,720);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,cash_received,change_amount,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260328-0028',v_cashier_id,1510,0,0,1510,'cash',2000,490,'completed','2026-03-28 08:30:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v1,'เสื้อยืดคอกลม สีขาว','ขาว / M',2,250,0,500),
  (gen_random_uuid(),v_sale_id,v_v3,'กางเกงขายาว ผ้าชิโน','เบจ / 30',1,650,0,650),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','ดำ / M',1,380,20,360);

  INSERT INTO sales(id,sale_number,cashier_id,subtotal,discount_amount,tax_amount,total,payment_method,status,created_at)
  VALUES(gen_random_uuid(),'SALE-20260328-0029',v_cashier_id,830,0,0,830,'promptpay','completed','2026-03-28 10:15:00+07') RETURNING id INTO v_sale_id;
  INSERT INTO sale_items(id,sale_id,variant_id,product_name,variant_label,quantity,unit_price,discount_amount,subtotal) VALUES
  (gen_random_uuid(),v_sale_id,v_v2,'เสื้อเชิ้ต แขนยาว','ขาว / L',1,450,0,450),
  (gen_random_uuid(),v_sale_id,v_v5,'กางเกงขาสั้น ผ้าร่ม','กรม / L',1,380,0,380);

END $$;

-- =============================================
-- 7. INVENTORY MOVEMENTS
-- =============================================
INSERT INTO inventory_movements(id,variant_id,type,quantity_change,reference_id,reference_type,note,created_by,created_at) VALUES
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1),'receive', 50,NULL::uuid,'adjust','รับสินค้าจากซัพพลายเออร์ครั้งแรก',(SELECT id FROM profiles LIMIT 1),'2026-01-02 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-002-L-BL' LIMIT 1),'receive', 30,NULL::uuid,'adjust','รับสินค้าจากซัพพลายเออร์',(SELECT id FROM profiles LIMIT 1),'2026-01-02 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-007-M-NV' LIMIT 1),'receive', 40,NULL::uuid,'adjust','รับสินค้าจากซัพพลายเออร์',(SELECT id FROM profiles LIMIT 1),'2026-01-02 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-009-M-BK' LIMIT 1),'receive', 40,NULL::uuid,'adjust','รับสินค้าจากซัพพลายเออร์',(SELECT id FROM profiles LIMIT 1),'2026-01-02 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1),'sell',   -8,NULL::uuid,'sale','ขายประจำสัปดาห์ ม.ค. สัปดาห์ 1',(SELECT id FROM profiles LIMIT 1),'2026-01-10 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-007-M-NV' LIMIT 1),'sell',   -6,NULL::uuid,'sale','ขายประจำสัปดาห์ ม.ค. สัปดาห์ 1',(SELECT id FROM profiles LIMIT 1),'2026-01-10 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-003-30-BG' LIMIT 1),'receive',25,NULL::uuid,'adjust','รับสินค้าเพิ่มเติม',(SELECT id FROM profiles LIMIT 1),'2026-01-15 10:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1),'sell',   -5,NULL::uuid,'sale','ขายประจำสัปดาห์ ม.ค. สัปดาห์ 3',(SELECT id FROM profiles LIMIT 1),'2026-01-24 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-009-M-BK' LIMIT 1),'receive', 35,NULL::uuid,'adjust','รับสินค้าจากซัพพลายเออร์รายใหม่',(SELECT id FROM profiles LIMIT 1),'2026-02-01 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1),'adjust', -2,NULL::uuid,'adjust','ตรวจนับสต็อก พบของขาด 2 ชิ้น',(SELECT id FROM profiles LIMIT 1),'2026-02-05 17:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-002-L-BL' LIMIT 1),'sell',   -7,NULL::uuid,'sale','ขายประจำสัปดาห์ ก.พ. สัปดาห์ 2',(SELECT id FROM profiles LIMIT 1),'2026-02-14 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-003-30-BG' LIMIT 1),'sell',  -9,NULL::uuid,'sale','ขายประจำสัปดาห์ ก.พ.',(SELECT id FROM profiles LIMIT 1),'2026-02-20 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-007-M-NV' LIMIT 1),'receive', 30,NULL::uuid,'adjust','รับสินค้าเพิ่มสต็อก',(SELECT id FROM profiles LIMIT 1),'2026-03-01 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-001-M-WH' LIMIT 1),'sell',  -10,NULL::uuid,'sale','ขายประจำสัปดาห์ มี.ค. สัปดาห์ 1',(SELECT id FROM profiles LIMIT 1),'2026-03-07 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-009-M-BK' LIMIT 1),'sell',  -12,NULL::uuid,'sale','ขายประจำสัปดาห์ มี.ค. สัปดาห์ 2',(SELECT id FROM profiles LIMIT 1),'2026-03-14 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-002-L-BL' LIMIT 1),'receive', 20,NULL::uuid,'adjust','รับสินค้าเพิ่มก่อนสิ้นเดือน',(SELECT id FROM profiles LIMIT 1),'2026-03-20 09:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-007-M-NV' LIMIT 1),'sell',   -8,NULL::uuid,'sale','ขายประจำสัปดาห์ มี.ค. สัปดาห์ 3',(SELECT id FROM profiles LIMIT 1),'2026-03-21 18:00:00+07'),
(gen_random_uuid(),(SELECT id FROM product_variants WHERE sku='SKU-003-30-BG' LIMIT 1),'sell',  -6,NULL::uuid,'sale','ขายประจำสัปดาห์ มี.ค. สัปดาห์ 4',(SELECT id FROM profiles LIMIT 1),'2026-03-28 09:00:00+07');
