#!/usr/bin/env node
/**
 * upload-product-images.mjs
 *
 * Run this locally to:
 * 1. Ensure the `product-images` storage bucket exists (public)
 * 2. Upload all generated product images to Supabase Storage
 * 3. Update existing products (that have no image) with matching image URLs
 * 4. Insert new sample products with images + variants
 *
 * Usage:
 *   node scripts/upload-product-images.mjs
 *
 * Requires: @supabase/supabase-js (already in project deps)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Load env from .env.local ──────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found! Copy .env.local.example and fill in your Supabase keys.')
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const BUCKET = 'product-images'
const IMAGE_DIR = path.join(__dirname, '..', 'product-images')

// ─── Image → Existing Product mapping ──────────────────────
// Maps generated image filenames to existing seed product names
const EXISTING_PRODUCT_IMAGE_MAP = {
  'tshirt-round-white.png': 'เสื้อยืดคอกลม สีขาว',
  'pants-long-black.png':   'กางเกงขายาว ผ้าชิโน',
  'pants-long-navy.png':    'กางเกงยีนส์ ทรงกระบอก',
  'skirt-black.png':        'กระโปรงสั้น ผ้าพลีท',
  'dress-floral.png':       'ชุดเดรส ลายดอก',
  'polo-navy.png':          'เสื้อโปโล สีกรม',
  'jacket-zip-black.png':   'เสื้อแจ็คเก็ต หนังPU',
  'shorts-khaki.png':       'กางเกงขาสั้น ผ้าร่ม',
  'polo-white.png':         'เสื้อเชิ้ต แขนยาว',   // closest match
  // สร้อยคอสวยๆ has no clothing image — skip
}

// ─── New products to insert ────────────────────────────────
const NEW_PRODUCTS = [
  {
    name: 'เสื้อโปโลดำ คลาสสิค',
    description: 'เสื้อโปโลสีดำ ผ้าคอตตอนเนื้อดี ใส่ทำงานหรือลำลอง',
    category_name: 'เสื้อ',
    base_price: 390, cost_price: 175, sku_prefix: 'SKU-011',
    image_file: 'polo-black.png',
    variants: [
      { color: 'ดำ', size: 'S', sku: 'SKU-011-S-BK', barcode: 'BC-011-S-BK', stock: 15 },
      { color: 'ดำ', size: 'M', sku: 'SKU-011-M-BK', barcode: 'BC-011-M-BK', stock: 22 },
      { color: 'ดำ', size: 'L', sku: 'SKU-011-L-BK', barcode: 'BC-011-L-BK', stock: 18 },
      { color: 'ดำ', size: 'XL', sku: 'SKU-011-XL-BK', barcode: 'BC-011-XL-BK', stock: 10 },
    ]
  },
  {
    name: 'เสื้อยืดคอกลม สีดำ',
    description: 'เสื้อยืดคอกลมสีดำ ผ้านุ่ม ใส่สบาย ใส่ได้ทุกโอกาส',
    category_name: 'เสื้อ',
    base_price: 250, cost_price: 120, sku_prefix: 'SKU-012',
    image_file: 'tshirt-round-black.png',
    variants: [
      { color: 'ดำ', size: 'S', sku: 'SKU-012-S-BK', barcode: 'BC-012-S-BK', stock: 20 },
      { color: 'ดำ', size: 'M', sku: 'SKU-012-M-BK', barcode: 'BC-012-M-BK', stock: 25 },
      { color: 'ดำ', size: 'L', sku: 'SKU-012-L-BK', barcode: 'BC-012-L-BK', stock: 18 },
    ]
  },
  {
    name: 'เสื้อโปโลชมพู',
    description: 'เสื้อโปโลสีชมพูสดใส ใส่ลำลองดูสุภาพ',
    category_name: 'เสื้อ',
    base_price: 380, cost_price: 170, sku_prefix: 'SKU-013',
    image_file: 'polo-pink.png',
    variants: [
      { color: 'ชมพู', size: 'S', sku: 'SKU-013-S-PK', barcode: 'BC-013-S-PK', stock: 12 },
      { color: 'ชมพู', size: 'M', sku: 'SKU-013-M-PK', barcode: 'BC-013-M-PK', stock: 16 },
      { color: 'ชมพู', size: 'L', sku: 'SKU-013-L-PK', barcode: 'BC-013-L-PK', stock: 10 },
    ]
  },
  {
    name: 'แจ็กเก็ตซิปหน้า สีกรม',
    description: 'แจ็กเก็ตซิปหน้าผ้าร่มสีกรม กันลม กันฝนเล็กน้อย',
    category_name: 'เสื้อ',
    base_price: 890, cost_price: 420, sku_prefix: 'SKU-014',
    image_file: 'jacket-zip-navy.png',
    variants: [
      { color: 'กรม', size: 'M', sku: 'SKU-014-M-NV', barcode: 'BC-014-M-NV', stock: 8 },
      { color: 'กรม', size: 'L', sku: 'SKU-014-L-NV', barcode: 'BC-014-L-NV', stock: 10 },
      { color: 'กรม', size: 'XL', sku: 'SKU-014-XL-NV', barcode: 'BC-014-XL-NV', stock: 6 },
    ]
  },
  {
    name: 'เสื้อยืด Oversize สีขาว',
    description: 'เสื้อยืดทรง Oversize สีขาว สไตล์สตรีท ใส่สบาย',
    category_name: 'เสื้อ',
    base_price: 350, cost_price: 150, sku_prefix: 'SKU-015',
    image_file: 'tshirt-oversize-white.png',
    variants: [
      { color: 'ขาว', size: 'M', sku: 'SKU-015-M-WH', barcode: 'BC-015-M-WH', stock: 20 },
      { color: 'ขาว', size: 'L', sku: 'SKU-015-L-WH', barcode: 'BC-015-L-WH', stock: 18 },
      { color: 'ขาว', size: 'XL', sku: 'SKU-015-XL-WH', barcode: 'BC-015-XL-WH', stock: 14 },
    ]
  },
  {
    name: 'เสื้อยืด Oversize สีดำ',
    description: 'เสื้อยืดทรง Oversize สีดำ ใส่ง่ายได้ทุกวัน',
    category_name: 'เสื้อ',
    base_price: 350, cost_price: 150, sku_prefix: 'SKU-016',
    image_file: 'tshirt-oversize-black.png',
    variants: [
      { color: 'ดำ', size: 'M', sku: 'SKU-016-M-BK', barcode: 'BC-016-M-BK', stock: 22 },
      { color: 'ดำ', size: 'L', sku: 'SKU-016-L-BK', barcode: 'BC-016-L-BK', stock: 20 },
      { color: 'ดำ', size: 'XL', sku: 'SKU-016-XL-BK', barcode: 'BC-016-XL-BK', stock: 12 },
    ]
  },
  {
    name: 'เสื้อกีฬาแดง ทีมชาติ',
    description: 'เสื้อกีฬาสีแดงสด ผ้าระบายอากาศ เหมาะสำหรับออกกำลังกาย',
    category_name: 'เสื้อ',
    base_price: 450, cost_price: 200, sku_prefix: 'SKU-017',
    image_file: 'sport-shirt-red.png',
    variants: [
      { color: 'แดง', size: 'S', sku: 'SKU-017-S-RD', barcode: 'BC-017-S-RD', stock: 15 },
      { color: 'แดง', size: 'M', sku: 'SKU-017-M-RD', barcode: 'BC-017-M-RD', stock: 20 },
      { color: 'แดง', size: 'L', sku: 'SKU-017-L-RD', barcode: 'BC-017-L-RD', stock: 12 },
    ]
  },
  {
    name: 'เสื้อกีฬาน้ำเงิน สปอร์ต',
    description: 'เสื้อกีฬาสีน้ำเงิน ผ้าไดรฟิต ระบายเหงื่อดี',
    category_name: 'เสื้อ',
    base_price: 450, cost_price: 200, sku_prefix: 'SKU-018',
    image_file: 'sport-shirt-blue.png',
    variants: [
      { color: 'น้ำเงิน', size: 'S', sku: 'SKU-018-S-BL', barcode: 'BC-018-S-BL', stock: 14 },
      { color: 'น้ำเงิน', size: 'M', sku: 'SKU-018-M-BL', barcode: 'BC-018-M-BL', stock: 18 },
      { color: 'น้ำเงิน', size: 'L', sku: 'SKU-018-L-BL', barcode: 'BC-018-L-BL', stock: 10 },
    ]
  },
  {
    name: 'หมวกแก๊ปปักโลโก้',
    description: 'หมวกแก๊ปสีดำ ปักโลโก้ร้าน สไตล์ทันสมัย',
    category_name: 'อื่นๆ',
    base_price: 290, cost_price: 120, sku_prefix: 'SKU-019',
    image_file: 'cap-brand.png',
    variants: [
      { color: 'ดำ', size: 'Free Size', sku: 'SKU-019-FS-BK', barcode: 'BC-019-FS-BK', stock: 30 },
      { color: 'กรม', size: 'Free Size', sku: 'SKU-019-FS-NV', barcode: 'BC-019-FS-NV', stock: 25 },
    ]
  },
  {
    name: 'เสื้อนักเรียนปักชื่อ',
    description: 'เสื้อนักเรียนผ้าคอตตอน พร้อมบริการปักชื่อ-โลโก้โรงเรียน',
    category_name: 'เสื้อ',
    base_price: 320, cost_price: 140, sku_prefix: 'SKU-020',
    image_file: 'school-shirt.png',
    variants: [
      { color: 'ขาว', size: 'S', sku: 'SKU-020-S-WH', barcode: 'BC-020-S-WH', stock: 30 },
      { color: 'ขาว', size: 'M', sku: 'SKU-020-M-WH', barcode: 'BC-020-M-WH', stock: 40 },
      { color: 'ขาว', size: 'L', sku: 'SKU-020-L-WH', barcode: 'BC-020-L-WH', stock: 25 },
      { color: 'ขาว', size: 'XL', sku: 'SKU-020-XL-WH', barcode: 'BC-020-XL-WH', stock: 15 },
    ]
  },
  {
    name: 'ยูนิฟอร์มบริษัท พร้อมปัก',
    description: 'ยูนิฟอร์มบริษัท ผ้าคอตตอนคุณภาพ พร้อมบริการปักโลโก้',
    category_name: 'เสื้อ',
    base_price: 420, cost_price: 190, sku_prefix: 'SKU-021',
    image_file: 'company-uniform.png',
    variants: [
      { color: 'ขาว', size: 'S', sku: 'SKU-021-S-WH', barcode: 'BC-021-S-WH', stock: 20 },
      { color: 'ขาว', size: 'M', sku: 'SKU-021-M-WH', barcode: 'BC-021-M-WH', stock: 35 },
      { color: 'ขาว', size: 'L', sku: 'SKU-021-L-WH', barcode: 'BC-021-L-WH', stock: 28 },
      { color: 'ขาว', size: 'XL', sku: 'SKU-021-XL-WH', barcode: 'BC-021-XL-WH', stock: 18 },
    ]
  },
]


// ════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════

async function main() {
  console.log('\n🚀 LookKuan — Product Image Upload Script\n')

  // ── Step 1: Ensure bucket exists ──
  console.log('📦 Step 1: Checking storage bucket...')
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === BUCKET)

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    })
    if (error) {
      console.error('  ❌ Failed to create bucket:', error.message)
      process.exit(1)
    }
    console.log('  ✅ Created public bucket:', BUCKET)
  } else {
    console.log('  ✅ Bucket already exists:', BUCKET)
  }

  // ── Step 2: Upload all images ──
  console.log('\n📤 Step 2: Uploading images...')
  const imageFiles = fs.readdirSync(IMAGE_DIR).filter(f => f.endsWith('.png'))
  const imageUrls = {} // filename -> public URL

  for (const file of imageFiles) {
    const filePath = path.join(IMAGE_DIR, file)
    const fileBuffer = fs.readFileSync(filePath)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      console.error(`  ❌ ${file}: ${error.message}`)
      continue
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(file)
    imageUrls[file] = urlData.publicUrl
    console.log(`  ✅ ${file}`)
  }

  console.log(`\n  Uploaded: ${Object.keys(imageUrls).length} / ${imageFiles.length} images`)

  // ── Step 3: Update existing products ──
  console.log('\n🔄 Step 3: Updating existing products with images...')
  let updatedCount = 0

  for (const [imageFile, productName] of Object.entries(EXISTING_PRODUCT_IMAGE_MAP)) {
    const url = imageUrls[imageFile]
    if (!url) {
      console.log(`  ⏭️  Skipped ${productName} — image not uploaded`)
      continue
    }

    const { data, error } = await supabase
      .from('products')
      .update({ image_url: url })
      .eq('name', productName)
      .is('image_url', null)
      .select('id, name')

    if (error) {
      console.error(`  ❌ ${productName}: ${error.message}`)
      continue
    }

    if (data && data.length > 0) {
      console.log(`  ✅ ${productName} → ${imageFile}`)
      updatedCount++
    } else {
      console.log(`  ⏭️  ${productName} — already has image or not found`)
    }
  }

  console.log(`\n  Updated: ${updatedCount} existing products`)

  // ── Step 4: Fetch category IDs ──
  console.log('\n📂 Step 4: Fetching categories...')
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name')

  if (catErr) {
    console.error('  ❌ Failed to fetch categories:', catErr.message)
    process.exit(1)
  }

  const catMap = {}
  for (const cat of categories) {
    catMap[cat.name] = cat.id
  }
  console.log(`  ✅ Found ${categories.length} categories:`, Object.keys(catMap).join(', '))

  // ── Step 5: Insert new products ──
  console.log('\n➕ Step 5: Inserting new products...')
  let insertedCount = 0

  for (const prod of NEW_PRODUCTS) {
    const url = imageUrls[prod.image_file]
    const categoryId = catMap[prod.category_name]

    if (!categoryId) {
      console.error(`  ❌ Category "${prod.category_name}" not found for ${prod.name}`)
      continue
    }

    // Check if product already exists (by sku_prefix to avoid duplicates on re-run)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku_prefix', prod.sku_prefix)
      .limit(1)

    if (existing && existing.length > 0) {
      // Product exists — just update the image if missing
      await supabase
        .from('products')
        .update({ image_url: url })
        .eq('id', existing[0].id)
        .is('image_url', null)
      console.log(`  ⏭️  ${prod.name} already exists (sku: ${prod.sku_prefix}), updated image if needed`)
      continue
    }

    // Insert product
    const { data: inserted, error: insertErr } = await supabase
      .from('products')
      .insert({
        name: prod.name,
        description: prod.description,
        category_id: categoryId,
        base_price: prod.base_price,
        cost_price: prod.cost_price,
        sku_prefix: prod.sku_prefix,
        image_url: url || null,
        is_active: true,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error(`  ❌ ${prod.name}: ${insertErr.message}`)
      continue
    }

    // Insert variants
    const variants = prod.variants.map(v => ({
      product_id: inserted.id,
      color: v.color,
      size: v.size,
      sku: v.sku,
      barcode: v.barcode,
      stock_quantity: v.stock,
      low_stock_threshold: 5,
      is_active: true,
    }))

    const { error: varErr } = await supabase
      .from('product_variants')
      .insert(variants)

    if (varErr) {
      console.error(`  ⚠️  ${prod.name} inserted but variants failed: ${varErr.message}`)
    } else {
      console.log(`  ✅ ${prod.name} + ${variants.length} variants`)
      insertedCount++
    }
  }

  console.log(`\n  Inserted: ${insertedCount} new products`)

  // ── Summary ──
  console.log('\n' + '═'.repeat(50))
  console.log('🎉 All done!')
  console.log(`   📸 Images uploaded: ${Object.keys(imageUrls).length}`)
  console.log(`   🔄 Existing products updated: ${updatedCount}`)
  console.log(`   ➕ New products created: ${insertedCount}`)
  console.log('═'.repeat(50))
  console.log('\n💡 Run `npm run dev` and visit http://localhost:3000 to see the landing page with images!\n')
}

main().catch(err => {
  console.error('💥 Unexpected error:', err)
  process.exit(1)
})
