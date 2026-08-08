# Garments E-Commerce — Phase 1: Foundation

This is Phase 1 of the full-stack garments e-commerce build: the database
schema, authentication, and project scaffolding that every later phase
(storefront, checkout, admin panel) builds on top of.

## What's included

**Backend (FastAPI + PostgreSQL)**
- Full normalized schema — 25 tables covering users, products, variants,
  inventory, carts, orders, payments, coupons, reviews, banners, and admin
  activity logs — implemented as SQLAlchemy models with proper FKs, enums,
  and timestamps.
- Alembic migrations, generated and tested against a real Postgres instance.
- JWT authentication: register, login, refresh, logout, forgot/reset
  password, `/me`.
- Role-based route protection (`customer` vs `admin`), verified with the
  `/api/admin/ping` route.

**Frontend (React 18 + Vite + Tailwind, JavaScript only)**
- Full route structure for both the customer storefront and `/admin` panel,
  matching the spec's sitemap.
- Working auth: register, login, logout, protected routes, admin-only routes,
  automatic token refresh on 401.
- Layouts: customer (announcement bar + navbar + footer) and admin (collapsible
  sidebar with all 12 sections).
- Design tokens (palette, type) applied consistently so later phases don't
  restyle from scratch.

Every route not yet built out (Shop, Product Details, Cart, Checkout, and the
admin data screens) is clearly labeled with which phase will implement it —
nothing is faked as working.

## Running it locally

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET_KEY at minimum

# Create the Postgres database first, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api/*` to `http://localhost:8000`)

### Creating an admin user

There's no admin-creation UI yet (that's part of Settings, Phase 6). For now,
register a normal account through the app, then promote it directly in the
database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## What's next

- **Phase 2** — Storefront: product catalog, filters/search/sort, product
  details, cart, wishlist, all wired to real endpoints.
- **Phase 3** — Checkout, addresses, order placement/tracking, Razorpay + COD.
- **Phase 4** — Admin: dashboard KPIs/charts, product + variant management,
  inventory, categories.
- **Phase 5** — Admin: order management, returns/refunds, customers, coupons,
  banners, homepage content, reviews.
- **Phase 6** — Reports/analytics, store settings, SEO, performance, and a
  full responsiveness/error-state pass.
