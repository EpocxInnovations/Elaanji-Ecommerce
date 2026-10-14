# Elaanji — Admin Documentation

> **Platform:** Full-stack e-commerce for luxury Indian sarees
> **Tech Stack:** FastAPI (Python) backend, React 18 + Vite + Tailwind CSS frontend, PostgreSQL
> **Target Audience:** Store administrators, content managers, operations staff

---

## 1. Accessing the Admin Panel

| Method | Details |
|---|---|
| **URL** | `http://localhost:5173/admin` (frontend dev server) or via the deployed application URL |
| **Credentials** | - Create a customer account first (storefront sign-up)<br>- Promote to admin via SQL: `UPDATE users SET role = 'admin' WHERE email = 'your_email';`<br>- Log in to the storefront, then navigate to `/admin` |
| **Alternative** | Backend API docs: `http://localhost:8000/docs` (Swagger UI for API endpoints) |

### Initial Admin Setup (one-time)

1. **Register a customer account** on the storefront (`http://localhost:5173`)
2. **Promote to admin** in PostgreSQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
   ```
3. **Log out and log back in** — the Admin Dashboard link will appear in the navigation

---

## 2. Dashboard & Analytics

The admin dashboard provides an at-a-glance view of store performance.

### Key Performance Indicators (KPIs)

| Metric | Description | Location |
|---|---|---|
| **Total Sales** | Revenue from all completed orders | Dashboard overview |
| **Active Orders** | Orders currently in fulfillment lifecycle | Dashboard overview |
| **Inventory Alerts** | Products below minimum stock threshold | Dashboard overview |
| **New Customers (30d)** | Count of unique users who registered in last 30 days | Dashboard overview |
| **Orders Today** | Count of orders placed today | Dashboard overview |

### Reports Section

| Report Type | What It Provides |
|---|---|
| **Sales Report** | Daily/weekly/monthly revenue trends, order counts, average order value |
| **Inventory Report** | Stock levels across all products, low-stock alerts, turnover rate |
| **Order Report** | Complete order history with status filters, exportable |
| **Customer Report** | User profiles, order histories, segmentation |
| **Coupon Report** | Coupon usage statistics, redemption rates, expiry analysis |

---

## 3. Catalog & Inventory Management

### Products Management

| Action | Path/Endpoint | Notes |
|---|---|---|
| **List products** | Admin UI → Catalog → Products or `GET /api/products/` | Paginated, searchable by name, category, SKU |
| **Create product** | Admin UI → Catalog → New Product | Fill form: title, description, price, compare-at-price, SKU, stock |
| **Update product** | Admin UI → Catalog → Select product | Edit any field; variants managed inline |
| **Delete product** | Admin UI → Catalog → Select product → Delete | Moves to trash; hard delete requires DB action |

### Product Variants

Each product can have multiple variants (color, size, fabric, etc.).

| Field | Type | Description |
|---|---|---|
| `variant_sku` | String | Unique SKU per variant (e.g., `ELK-24K-GOLD`) |
| `variant_color` | String | Color name/hex (e.g., `Gold`, `#FFD700`) |
| `variant_size` | String | Size (e.g., `Free`, `S`, `M`, `L`) |
| `variant_price` | Float | Price override for this variant (optional) |
| `variant_stock` | Integer | Stock count specific to this variant |
| `is_preorder` | Boolean | Mark as pre-order |
| `expected_ship_date` | Date | Expected ship date for pre-orders |

### Categories

- **Hierarchical categories** — parent/child structure for mega-menu
- **Create:** Admin UI → Catalog → Categories → New Category
- **Attributes per category:** Description, image, slug for SEO
- **Reorder:** Drag-handle to change display order in navigation

### Inventory Operations

| Operation | Description |
|---|---|
| **Manual stock update** | Per-variant stock adjustment (add/subtract) |
| **Low-stock threshold** | Configurable per product/variant; triggers dashboard alert |
| **Bulk update** | Select multiple products → adjust stock by percentage or absolute value |
| **Inventory audit** | Export current stock levels; compare with physical count |

---

## 4. Order & Fulfillment Management

### Order Lifecycle

Orders progress through these statuses (configurable per business flow):

```
Pending → Processing → Shipped → Delivered
     ↓              ↓
   Cancelled → Refunded
```

### Order Actions

| Action | Description | API/UI |
|---|---|---|
| **View order** | Click order ID in list | Shows full details: items, customer, payments, notes |
| **Update status** | Change order status (e.g., Processing → Shipped) | Inline select or batch update |
| **Add note** | Internal order note visible to admin only | Free text, timestamped |
| **Issue refund** | Process refund for order (partial or full) | Triggers payment gateway refund if applicable |
| **Export order** | Download CSV/JSON of order details | Includes item-level breakdown |

### Fulfillment Workflow

1. **Receive order** → Set status to `Processing`
2. **Prepare shipment** → Add tracking number, set status to `Shipped`
3. **Customer delivery** → Set status to `Delivered`
4. **Return requested** → Set status to `Refunded` or `Cancelled`
5. **Refund completed** → Issue refund via payment gateway, set status to `Refunded`

---

## 5. Customer & Marketing Management

### Customers

| Action | Description |
|---|---|
| **List customers** | Admin UI → Customers → All Customers | Search by name, email; filter by registration date, total spent |
| **View profile** | Click customer ID | Full profile: contact info, order history, notes, tags |
| **Update role** | Promote/demote user role | `UPDATE users SET role = 'admin'/`user`;` |
| **Export customer data** | CSV export for analytics or mailers |

### Coupons

| Field | Description |
|---|---|
| `code` | Coupon code (e.g., `WELCOME10`) |
| `discount_type` | `percentage` or `fixed_amount` |
| `discount_value` | Discount amount (e.g., `10` for 10% or `$10 off`) |
| `usage_limit` | Max total uses (0 = unlimited) |
| `usage_per_user` | Max uses per customer (0 = unlimited) |
| `min_spend` | Minimum order total to apply |
| `valid_from` / `valid_until` | Date range for validity |
| `is_active` | Enable/disable without deleting |

### Reviews

| Action | Description |
|---|---|
| **Moderate reviews** | Pending reviews require approval before publishing |
| **Flag inappropriate** | Mark review as spam/abuse |
| **Reply to reviews** | Admin reply visible alongside customer review |
| **Edit/delete** | Remove offensive content or correct errors |

### Banners & Homepage Content

| Element | Management |
|---|---|
| **Hero banner** | Admin UI → Settings → Banners → Upload image, set link URL |
| **Promotional banners** | Rotating carousel on homepage |
| **Featured collections** | Select collections/products to showcase |
| **SEO settings** | Page titles, meta descriptions for collection pages |

### Settings

| Category | Sub-settings |
|---|---|
| **General** | Store name, contact email, timezone, currency |
| **Payment** | Razorpay configuration, COD availability, payment statuses |
| **Shipping** | Shipping zones, rates, delivery estimates, return window |
| **Email** | SMTP settings, email templates (order confirmations, shipping updates) |
| **SEO** | Global meta tags, default OpenGraph images |

---

## 6. Advanced Admin Operations

### Activity Logs

- **View:** Admin UI → Settings → Activity Logs
- **What's logged:** User actions (create/update/delete), status changes, authentication events
- **Retention:** Configurable (default 90 days)
- **Export:** Download log file for auditing

### Rate Limiting

- **Per-endpoint limits** configured in backend `middleware/rate_limit.py`
- **Admin endpoints** have higher thresholds than customer-facing
- **Triggered:** HTTP 429 with `Retry-After` header
- **Override:** Contact super-admin or adjust config

### SEO Basics

| Element | Where to Configure |
|---|---|
| **Meta title** | Per-page in admin UI |
| **Meta description** | Per-page in admin UI |
| **OpenGraph image** | Admin → Settings → SEO |
| **Sitemap** | Automatically generated at `/sitemap.xml` (backend root) |

---

## 7. Troubleshooting

### Common Admin Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| **Can't access `/admin`** | User role not set to `admin` | Run `UPDATE users SET role = 'admin' WHERE email = '...';` |
| **Dashboard KPIs show 0** | No orders/products in DB yet | Add sample data: `python scripts/seed_catalog.py` |
| **Can't create products** | Missing required fields | Ensure all fields marked with `*` are filled |
| **Coupon not applying** | `min_spend` not met or `usage_limit` reached | Check coupon details and customer cart total |
| **Orders not updating status** | Workflow transition not allowed | Verify status transition matrix in code/config |

### Database Diagnostics

```bash
# Check database connectivity
psql -U postgres -d Elaanji -c "\dt"

# List all tables
psql -U postgres -d Elaanji -c "\dt"

# Check user roles
psql -U postgres -d Elaanji -c "SELECT email, role FROM users;"

# Check pending reviews
psql -U postgres -d Elaanji -c "SELECT * FROM reviews WHERE status = 'pending';"
```

### Rebuilding Admin UI State

If the admin interface appears broken or stale:

1. **Clear browser cache** (Ctrl+F5 or Cmd+Shift+R)
2. **Restart dev servers:** Stop both frontend (`Ctrl+C`) and backend (`Ctrl+C`), then `npm run dev` and `uvicorn app.main:app --reload`
3. **Re-promote admin user** if role reset occurred

---

## 8. API Reference (for Custom Integrations)

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

- **Method:** Bearer token (JWT)
- **Obtain token:** `POST /auth/token` with `email` + `password`
- **Include in headers:** `Authorization: Bearer <token>`

### Key Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET /admin/dashboard/stats` | Dashboard KPIs summary |
| `GET /admin/products` | List products with pagination |
| `POST /admin/products` | Create new product |
| `PUT /admin/products/{id}` | Update product |
| `DELETE /admin/products/{id}` | Delete product |
| `GET /admin/orders` | List orders with filters |
| `PUT /admin/orders/{id}/status` | Update order status |
| `GET /admin/customers` | List customers |
| `GET /admin/coupons` | List coupons |
| `POST /admin/coupons` | Create coupon |
| `GET /admin/reviews` | List reviews |
| `PUT /admin/reviews/{id}/status` | Approve/reject review |
| `GET /admin/activity-logs` | Activity feed |
| `GET /admin/settings` | Get all settings |
| `PUT /admin/settings` | Update all settings |

### Webhook Events

| Event | Triggered When |
|---|---|
| `order.created` | New order placed |
| `order.status_changed` | Order status updated |
| `refund.processed` | Refund completed |
| `coupon.redeemed` | Coupon used on order |
| `product.low_stock` | Stock falls below threshold |

---

## 9. Deployment Checklist (Production)

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Configure `ALLOWED_HOSTS` in FastAPI settings
- [ ] Set `CORS_ORIGINS` for frontend domain
- [ ] Generate HTTPS certificate (Let's Encrypt or self-signed)
- [ ] Set `JWT_SECRET_KEY` and rotate regularly
- [ ] Configure NVIDIA LLM API keys if AI features enabled
- [ ] Set up PostgreSQL backups (daily)
- [ ] Enable rate limiting in production config
- [ ] Test admin access with promoted admin account
- [ ] Verify sitemap `/sitemap.xml` accessible
- [ ] Check all API endpoints in `/docs` work as expected

---

*Document last updated: 2026-10-08*
*For support, contact the development team or check the issue tracker.*