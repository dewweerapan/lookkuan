# LookKuan E2E Tests

Comprehensive Playwright end-to-end tests for the LookKuan POS application.

## Test Files

### 01-auth.spec.ts (4.4 KB)
**Authentication & Access Control**
- Login with valid credentials → redirect to /dashboard
- Login error handling (wrong password, wrong email)
- Form validation (required fields)
- PIN login link navigation
- Unauthenticated users redirected to /login
- Session persistence across routes
- Responsive layout on mobile

### 02-dashboard.spec.ts (4.8 KB)
**Dashboard Overview**
- Page title and sidebar display
- 4 stat cards: ยอดขายวันนี้, รายการขายวันนี้, งานปักที่รอดำเนินการ, สินค้าทั้งหมด
- Quick action buttons: ขายสินค้า, รับงานปัก, จัดการสต็อก, ลูกค้า
- Navigation from quick actions to relevant pages
- Sidebar navigation with all menu items: หน้าหลัก, สินค้าและสต็อก, ขายสินค้า, งานปักเสื้อ, ลูกค้า, รายงาน, ตรวจจับทุจริต, ตั้งค่าระบบ
- Low stock alerts and navigation
- Responsive layout

### 03-inventory.spec.ts (10 KB)
**Inventory Management**

**Inventory List:**
- Load products from database
- Display inventory stats (items, value, low stock count)
- Search filtering
- Category filtering
- Action buttons: เพิ่มสินค้า, หมวดหมู่, ประวัติสต็อก

**Add New Product:**
- Navigate to /inventory/new
- Form fields: name, description, category, price, cost
- Variant management (size, color, price override)
- Form submission and success handling

**Product Detail:**
- Navigate to detail page from product list
- Display product information
- Tabs: details, variants, movements
- Stock adjustment functionality

**Categories:**
- Navigate to /inventory/categories
- Display categories list
- Add category option
- Inline category management

**Inventory Movements:**
- Navigate to /inventory/movements
- Display movement history table
- Movement columns: date, product, type, quantity
- Filter and search functionality

### 04-pos.spec.ts (13 KB)
**Point of Sale**

**POS Page Loading:**
- Product grid display
- Cart panel visibility
- Search functionality

**Category Filtering:**
- Category tabs/buttons (ทั้งหมด + other categories)
- Filter products by category
- Dynamic product list update

**Cart Operations:**
- Add product to cart by clicking
- Display cart with items
- Show product name and price in cart
- Increase quantity with + button
- Decrease quantity with - button
- Remove item from cart
- Display cart total

**Payment:**
- Show payment panel when cart has items
- Select payment method (เงินสด, โอน, promptpay, card)
- Cash payment processing with change calculation
- Display receipt after successful payment

**Barcode Scanning:**
- Support for keyboard barcode input
- Toast notifications for scanned products
- Error handling for invalid barcodes

### 05-job-orders.spec.ts (13 KB)
**Embroidery Job Orders**

**Job Orders List:**
- Load job orders page (/job-orders)
- Display create new job order button
- Kanban board and table view options
- Search functionality
- View toggle between Kanban/Table

**Create New Job Order:**
- Navigate to /job-orders/new
- Customer information fields: name, phone
- Garment details: type, quantity
- Pricing: price, deposit
- Deadline field
- Staff assignment
- Form submission

**Job Order Detail:**
- Navigate to detail page (/job-orders/[id])
- Display job order information
- Status badge
- Status transitions: pending → in_progress → completed
- Customer and garment details display

**Public Order Tracking:**
- Access /track/[orderNumber] without authentication
- Display order progress
- Show order status and timeline
- No auth required for public access

### 06-reports.spec.ts (12 KB)
**Reports & Risk Dashboard**

**Reports Page:**
- Load /reports
- Sales summary section with charts
- Payment breakdown section
- Top products section
- Date range filtering
- Metrics cards display
- Export/download options
- Dynamic data updates on filter change

**Risk Dashboard:**
- Load /risk-dashboard
- Void rate metric (ยกเลิก %)
- Price override metric (ลด)
- Cash discrepancy metric (เงินสด)
- Employee void statistics table
- Alert indicators for high-risk metrics
- Date range filtering
- Employee per-transaction void analysis

**Customers Page:**
- Load /customers
- Display customer list/table
- Show customer count
- Search functionality
- Customer details in table rows
- Navigate to customer detail
- Add/edit/delete customer options

**Navigation:**
- Access Reports from sidebar
- Access Risk Dashboard from sidebar
- Navigation persistence

### 07-settings.spec.ts (14 KB)
**Settings & Administration**

**Settings Page:**
- Load /settings (admin only)
- Display system statistics
- System info display
- Settings navigation menu
- Link to users management page
- System health status
- System configuration options
- Save/update functionality

**Users Management:**
- Load /settings/users
- Display users list/table
- Show user names and roles
- Role badges: admin, staff, cashier, embroidery
- User action buttons: edit, delete
- Add user button
- Search users functionality
- User status display: active/inactive
- User role modification
- User deactivation/reactivation

**Settings Navigation:**
- Navigate from dashboard sidebar
- Navigate between settings sections
- Return to main settings page
- Navigation menu within settings

**Admin Access Control:**
- Verify admin-only access restriction
- Display admin-only features
- Access denied for non-admin users

**System Configuration:**
- Business info fields: name, address
- Currency settings
- Business hours configuration
- Database connection status display

## Test Structure

All tests use:
- **Playwright Test** framework (@playwright/test)
- **test.describe()** for grouping related tests
- **test.beforeEach()** for setup (navigation to page)
- **await expect()** for assertions with Playwright matchers
- **Thai UI labels** matching actual app text
- **Relative paths** with page.goto() (e.g., '/dashboard')
- **waitForLoadState('networkidle')** for async data loading
- **Fallback patterns** with `.isVisible().catch(() => false)` for flexible element detection

## Prerequisites

Tests assume:
1. Dev server running: `npm run dev`
2. Auth state saved in `e2e/.auth/user.json` (from auth.setup.ts)
3. Test credentials in .env.local:
   - TEST_EMAIL=jizrix@gmail.com
   - TEST_PASSWORD=test123456
4. Playwright configuration in `playwright.config.ts`

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (browser visible)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/01-auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "Dashboard"

# Run with debug mode
npx playwright test --debug

# Generate test report
npx playwright test && npx playwright show-report
```

## Coverage

- **Authentication**: 6 tests
- **Dashboard**: 11 tests
- **Inventory**: 18 tests
- **POS**: 16 tests
- **Job Orders**: 15 tests
- **Reports & Risk**: 21 tests
- **Settings**: 21 tests

**Total: ~108 test cases across 1,769 lines of code**

## Key Test Features

✅ Thai language label matching
✅ Flexible element detection with fallbacks
✅ Network activity waiting with waitForLoadState
✅ Form filling and submission
✅ Navigation and URL assertion
✅ Modal and dialog handling
✅ Mobile viewport testing
✅ Multi-view testing (Kanban/Table toggle)
✅ Public page access (no auth required)
✅ Admin access control verification
✅ Payment flow simulation
✅ Stock/inventory operations
✅ CRUD operations on resources

## Notes

- Tests are designed to work with the existing auth setup (auth.setup.ts)
- Flexible selectors used to handle UI variations
- Tests check for element visibility before interaction
- Network waits included for pages with async data loading
- Each test is independent and can run in any order
- Mobile responsiveness tested on specific flows
- Public pages tested in separate browser context

## Development Tips

When adding new tests:
1. Use `getByLabel()` for form fields matching Thai labels
2. Use `getByRole()` for buttons and links with Thai text
3. Use `getByText()` for headings and labels
4. Add `.catch(() => false)` to optional element checks
5. Use `waitForLoadState('networkidle')` for data-heavy pages
6. Group related tests with `test.describe()`
7. Use `test.beforeEach()` for common setup

